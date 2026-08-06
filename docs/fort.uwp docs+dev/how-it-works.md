---
sidebar_position: 2
---
# how it works

## what it is

fort.uwp is a native Windows app for fort.ind - built mainly so people on Windows devices have a nice native shell, since the full experience really lives on the website. It's explicitly a beta, so don't expect every feature to be finished quite yet.

## the stack

- **UWP written in VB.NET** (yep, VB, not C#)
- **WinUI 2** for controls (`NavigationView`, acrylic, Reveal, etc.), aiming for a Windows 10 fluent look rather than Windows 11 style
- No MVVM framework and no dependency injection - just XAML pages with code-behind, calling plain static "service" classes directly.

## the app!

The whole app is one `NavigationView` inside `MainPage`. Most sections are just panels that get shown/hidden - only **Profile** is a "real" page navigated inside a nested frame (this split is deliberate, see `MainPage.xaml.vb`'s `ShowContent` method if you're curious why).

- **Home** - a static "latest news" panel
- **Games** - view a list of fort.ind games
- **Beta Programs** - placeholder
- **Profile** - logs in with your fort.social account it opens your system browser (not an embedded webview - the Misskey/Sharkey frontend doesn't play nice with UWP's embedded browser), you approve the session on fort.social, and it hands control back to the app through a `fortind://` link. The access token lives in the Windows Credential Vault, never on disk. Profile data itself is read-only - your fort.social account is your profile (what else would it be??), so edits happen on there.
- **Social** - placeholder
- **Settings** - theme + accent color, where your local data lives (with a "clear login info" and "reset app" option), Live tile refresh/clear, show the welcome dialog, and an About section with links to the site, gitHub repo, and the issues page
- **Search** - a search box that looks across the nav items, your profile (if signed in), and a bundled snapshot of the fort1nd.com sitemap. Picking a site result opens it in your browser; picking a nav item navigates in-app.

There's also Live Tile/badge/toast notifications.

## storage

theres really no DB or anything here

- `ApplicationData.LocalSettings` for small stuff like theme and UI settings
- Local JSON files for a cached copy of your profile and the parsed sitemap
- Windows Credential Vault for the one actual secret (your fort.social access token)

The app only talks to `social.fort1nd.com` (for sign-in)
