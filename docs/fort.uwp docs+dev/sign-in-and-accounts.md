---
sidebar_position: 3
---
# sign-in & accounts 

fort.uwp doesn't have its own accounts system - signing in just links the app to your existing **fort.social** account (fort.social runs Sharkey/Misskey). This page walks through exactly how that works, mostly based on `Services\MisskeyAuthService.vb` and `Services\ProfileService.vb`.

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
5. If the app process that started the sign-in is still alive and waiting, this just unblocks it. If the app was suspended or fully restarted while you were in the browser, the session ID is instead recovered straight from the callback URL's query string and the exchange continues from there - either way, the same next step runs:
6. **Token exchange**: `POST https://social.fort1nd.com/api/miauth/{session}/check` - if fort.social confirms the session was approved, this returns an access token and the account's profile info in one response.
7. The token goes straight into the **Windows Credential Vault** (`PasswordVault`, resource `Fort.ind.Misskey`) - it's never written to a plain file. The profile is cached locally via `LocalStorageService` and `ProfileService.CurrentUser` is updated, which fires the `AuthStateChanged` event that `MainPage`/`ProfilePage` wait to.

The whole flow times out after **5ish** minutes if you never finish it in the browser, and can be cancelled mid-flight (e.g. if you close fort.social).

## staying signed in

On every launch, `ProfileService.TryRestoreSessionAsync` runs:

- If there's no token in the Credential Vault, you're just signed out - nothing else happens.
- If there's a token **and** a cached profile on disk, the cached profile is shown immediately (so the UI never blocks on a network call), and a fresh copy is fetched from `POST /api/i` in the background to quietly update it.
- If there's a token but **no** cached profile yet (e.g. right after an update), it fetches synchronously instead before showing anything.
- If the background refresh fails - say, the token was revoked on fort.social's side - the app quietly keeps showing the last-known cached profile rather than kicking you out. You only actually get signed out by hitting Sign Out yourself (or "clear login info" in Settings), and then the cached data is then pirged 

## what fort.uwp can and can't do with your account

The app only ever requests the `read:account` permission via MiAuth - it can read your profile, not post or manage your account. `ProfilePage` is intentionally **read-only**: so any actual profile editing happens over there, not in the app.
