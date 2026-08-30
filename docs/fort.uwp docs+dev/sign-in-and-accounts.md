---
sidebar_position: 3
---
# sign-in & accounts 

fort.uwp doesn't have its own accounts system - signing in just links the app to your existing **fort.social** account (fort.social runs Sharkey/Misskey). This page walks through exactly how that works, mostly based on `Services\MisskeyAuthService.cs` and `Services\ProfileService.cs`.

## why not an embedded browser?

The obvious way to do this in UWP is `WebAuthenticationBroker`, which pops up an embedded web view. That doesn't work here sharkey is a bit too new for EdgeHTML and it will end up getting stuck in a loading loop instead it takes you to your default browser that (hopefully) is more updated and can handle the Sharkey frontend. The app then gets control back via a custom `fortind://` link

## the flow, step by step

1. **`ProfileService.LoginWithMisskeyAsync`** calls **`MisskeyAuthService.SignInAsync`**, which generates a random session ID (a GUID) and builds a MiAuth URL:
   ```
   https://social.fort1nd.com/miauth/{session}?name=Fort.ind&callback=fortind://miauth-callback?session={session}&permission=read:account
   ```
2. That URL is opened with `Windows.System.Launcher.LaunchUriAsync` - i.e. your system's default browser, not anything embedded in the app.
3. You approve (or deny) the sign-in on fort.social. If approved, fort.social redirects the browser to the `callback` URL above - a `fortind://` link.
4. Windows sees the app is registered for the `fortind:` protocol (declared in `Package.appxmanifest`) and re-activates the app with that URI, landing in **`App.OnActivated`**, which hands it to **`MisskeyAuthService.HandleProtocolActivationAsync`**.
5. That handler never trusts the incoming callback on its own - anyone can invoke a registered custom URI scheme (another installed app, a webpage link, a crafted shortcut), not just fort.social. It only proceeds if the callback's session matches a session the app itself issued:
   - If the app process that started the sign-in is still alive and waiting on that exact session, this just unblocks it.
   - If the app was suspended or fully restarted while you were in the browser, the session instead has to match one `SignInAsync` persisted to `LocalSettings` before launching the browser - and that persisted session has to still be within its own 10-minute expiry.
   - A callback that matches neither is rejected outright ("This sign-in link is not valid.") rather than silently accepted.
6. **Token exchange**: `POST https://social.fort1nd.com/api/miauth/{session}/check` - if fort.social confirms the session was approved, this returns an access token and the account's profile info in one response.
7. The token goes straight into the **Windows Credential Vault** (`PasswordVault`, resource `Fort.ind.Misskey`) - it's never written to a plain file (i mean no one here needs to know your password is hunter2). The profile is cached locally via `LocalStorageService` and `ProfileService.CurrentUser` is updated, which fires the `AuthStateChanged` event that `MainPage`/`ProfilePage` wait to, and pops a "Welcome back!" toast notification.

On `LoginPage`, the very first time you ever land there, a teaching tip pops up pointing at the **Skip** button - just a one-time nudge that you don't *have* to sign in to use the app. It only shows once (tracked by a `HasSeenSkipSignInTip` local setting), not on every visit.

:::note
There are two separate timeouts here, easy to conflate. If the app stays alive and waiting, `SignInAsync` gives up after **5 minutes**. But the session it persisted for the cold-start case (step 5, second bullet) stays valid for **10 minutes** - that window exists specifically to survive the app being suspended or killed while you're off in the browser doing login stuff, which can easily take longer than the in-process wait would otherwise allow.
:::

The flow can also be cancelled mid-flight (e.g. if you close fort.social without approving or if you went to get a snack and decide to login later).

## staying signed in

On every launch, `ProfileService.TryRestoreSessionAsync` runs:

- If there's no token in the Credential Vault, you're just signed out - nothing else happens.
- If there's a token **and** a cached profile on disk, the cached profile is shown immediately (so the UI never blocks on a network call), and a fresh copy is fetched from `POST /api/i` in the background to quietly update it.
- If there's a token but **no** cached profile yet (e.g. right after an update), it fetches synchronously instead before showing anything.
- If the background refresh fails - say, the token was revoked by you - the app quietly keeps showing the last-known cached profile rather than kicking you out. You only actually get signed out by hitting Sign Out yourself (or "clear login info"/"reset app" in Settings), and then the cached data is then purged, with a "Signed out, goodbye!" toast
- If the background refresh *succeeds* but you signed out, reset the app, or signed into a different account while that network call was still in flight, the result is discarded instead of applied - it only gets written back if the token it was fetched for is still the one currently signed in. Otherwise a slow response could silently resurrect a session you'd already cleared.

## what fort.uwp can and can't do with your account

The app only ever requests the `read:account` permission via MiAuth - it can read your profile, not post or manage your account. `ProfilePage` is intentionally **read-only**: it shows your display name, handle, bio, avatar, and member-since/last-signed-in dates, plus a **"Manage on fort.social"** button that opens your exact profile page (`https://{host}/@{username}`) in your browser - that's where any actual editing happens, not in the app.
