---
sidebar_position: 2
---
# how it works

## what it is

fort.uwp is a native Windows app for fort.ind - built mainly so people on Windows devices have a native shell, since the full experience really lives on the website. It's a beta, so don't expect every feature to be finished quite yet.

## the stack

- **UWP in C#** (it used to be VB.NET - the whole thing got migrated over)
- **WinUI 2** for controls like the accent-color picker, aiming for a Windows 10 fluent look rather than Windows 11 style. The nav pane itself is the odd one out here: it's declared with no `muxc:` prefix, so it actually resolves to the **platform** `NavigationView`,
- No MVVM framework and no dependency injection - just XAML pages with code-behind, calling plain static "service" classes directly
- Every display string lives in a resource file (`Strings\en-US\Resources.resw`), not hardcoded in XAML or C# - see [contributing](./contributing.md)

## the app!

The whole app is one `NavigationView` inside `MainPage`. Most sections are just panels that get shown/hidden - **Profile** and **Games** are "real" pages inside a nested frame

- **Home** - a static "latest news" panel
- **Games** - shows games!! it loads the games out of the sitemap, lets you filter them by name as you type, and groups them alphabetically with a pinch/click-to-zoom jump grid (like the old Windows 8 Start screen letter zoom)
- **Beta Programs** - placeholder
- **Profile** - logs in with your fort.social account: it opens your system browser (not an embedded webview - the Misskey/Sharkey frontend doesn't play nice with UWP's embedded browser), you approve the session on fort.social, and goes back to the app via a `fortind://` link. The access token lives in the Windows Credential Vault, never on disk. Profile data itself is read-only - your fort.social account is your profile (what else would it be??), so edits happen over there.
- **Social** -placeholder
- **Settings** - theme + accent color, where your local data lives (with a "clear login info" and "reset app" option), Live Tile refresh/clear plus a toggle for the taskbar badge, show the welcome dialog, and an About section with links to the site, GitHub repo, and the issues page
- **Search** - a search box that looks across the nav items, your profile (if signed in), and a bundled snapshot of the fort1nd.com sitemap. Picking a site result opens it in your browser; picking a nav item navigates in-app.

There's also Live Tile/badge/toast notifications!

## storage

theres really no DB or anything here

- `ApplicationData.LocalSettings` for small stuff like theme, tint, and UI settings
- Local JSON files for a cached copy of your profile and the parsed sitemap
- Windows Credential Vault for the one actual secret (your fort.social access token)
- A small folder of cached, circle-cropped avatar PNGs so the nav pane's profile icon doesn't have to re-download and re-process your avatar on every launch

The app only talks to `social.fort1nd.com` (for sign-in, your profile, and your avatar)
