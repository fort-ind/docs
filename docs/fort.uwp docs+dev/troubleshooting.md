---
sidebar_position: 5
---
# troubleshooting

Common problems people run into building, installing, or running fort.uwp - and why they happen.

## install / sideload issues

### "This app package is not signed with a trusted certificate" or install just fails silently

fort.uwp isn't Store-signed - it ships as a sideloaded MSIX/APPX with a self-signed cert. You need to install the `.cer` file **before** installing the app itself, and it has to go into the right store:

- Open the `.cer` → Install Certificate → **Local Machine** → **Trusted People**
- Not Trusted Root Certification Authorities - that's the most common mistake here and it'll silently fail (or refuse) install if you pick it

Easiest fix: just run the included `scripts\Install.ps1` as admin - it installs the cert to the right place, installs the VCLibs/WinUI runtime dependencies, and turns on sideloading for you in one step.

### "Sideloading apps is not allowed" / can't install at all

Developer Mode (or "Sideload apps") needs to be on: Windows Settings → Update & Security → For developers. `Install.ps1` will enable this for you if it's off; Visual Studio will also prompt you the first time you try to deploy.

### missing dependency errors (VCLibs, WinUI runtime)

The app depends on `Microsoft.VCLibs.140.00` and the `Microsoft.UI.Xaml.2.8` (WinUI 2) runtime package being present. `Install.ps1` checks for both and downloads/installs whichever is missing - if you're installing manually instead, you'll need to grab and install those yourself first. 

## sign-in issues

### stuck on the "waiting for browser" screen

The sign-in flow times out after 5 minutes (see [sign-in & accounts](./sign-in-and-accounts.md)) - if your browser session stalls or you close the tab without approving/denying, just cancel and try again from `LoginPage`.

### signed in, but profile info looks stale

This is expected, not a bug: on launch, the app shows your **cached** profile immediately and refreshes it from fort.social in the background. If that background refresh fails (offline, or the token was revoked on fort.social's end), the app just keeps showing the last-known cached data rather than signing you out - you won't get logged out automatically, only by explicitly signing out or clearing login info in Settings.

### can't edit my profile from the app

That's intentional - `ProfilePage` is read-only. fort.social is the source of truth for your account, so edits happen there, not in fort.uwp.

## build issues

### `dotnet build` fails or can't find the project type

This is a legacy-style UAP project, not an SDK-style one - it needs MSBuild with UWP/XAML build targets, which only come with Visual Studio's "Universal Windows Platform development" workload. See [building it](./building.md).

### can't deploy/debug to ARM or ARM64

There's no ARM emulator for a typical x64 dev machine - you'll need an actual ARM/ARM64 device (or a remote machine connection) to deploy and debug those platform configurations.

## still stuck?

Check the About section in Settings for links to the GitHub repo and issue tracker - that's the best place to see if something's a known issue or to report a new one.
