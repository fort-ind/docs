---
sidebar_position: 2
---
# how it works

## what it is

fort.uwp (internally `Fort.ind UWP`, shows up as "fort.desktop" once installed) is a native Windows app for **fort1nd.com** - built mainly so people on Windows 10 (1809+) and Windows-on-ARM devices have a nice native shell, since the full experience really lives on the website. It's explicitly a prototype and might get rebuilt in plain WinUI down the line, so don't expect every feature to be fleshed out yet.

## the stack

- **UWP written in VB.NET** (yep, VB, not C#)
- **WinUI 2** for controls (`NavigationView`, acrylic, Reveal, etc.), aiming for a Windows 10 Fluent look rather than Windows 11 style
- No MVVM framework and no dependency injection - just XAML pages with code-behind, calling plain static "service" classes directly.

## the app, section by section

The whole app is one `NavigationView` inside `MainPage`. Most sections are just panels that get shown/hidden - only **Profile** is a "real" page navigated inside a nested frame (this split is deliberate, see `MainPage.xaml.vb`'s `ShowContent` method if you're curious why).

- **Home** - a static "latest news" panel, also used to seed the Live Tile on launch
- **Games** - view a list of fort.ind games
- **Beta Programs** - placeholder, "coming soon"
- **Profile** - sign in with your fort.social account via **MiAuth**: it opens your system browser (not an embedded webview - the Misskey/Sharkey frontend doesn't play nice with UWP's embedded browser), you approve the session on fort.social, and it hands control back to the app through a custom `fortind://` link. The access token lives in the Windows Credential Vault, never on disk. Profile data itself is read-only here - your fort.social account is your profile (what else would it be??), so edits happen on the instance.
- **Social** - placeholder, "coming soon"
- **Settings** - theme + accent color, where your local data lives (with a "clear login info" and "reset app" option), Live tile refresh/clear, replay the welcome dialog, and an About section with links to the site, gitHub repo, and issue tracker
- **Search** - a search box that looks across the nav items, your profile (if signed in), and a bundled snapshot of the fort1nd.com sitemap. Picking a site result opens it in your browser; picking a nav item navigates in-app.

There's also a first-run welcome dialog, a custom acrylic title bar, and Live Tile/badge/toast notifications.

## storage

theres really no DB or anything here

- `ApplicationData.LocalSettings` for small stuff like theme and UI state
- Local JSON files for a cached copy of your profile and the parsed sitemap
- Windows Credential Vault for the one actual secret (your fort.social access token)

The app only talks to `social.fort1nd.com` over the internet (for sign-in) - everything else is either bundled with the app or opened as a link in your browser.
