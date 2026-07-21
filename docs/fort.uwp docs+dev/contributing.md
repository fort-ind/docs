---
sidebar_position: 6
---
# contributing

## project layout

Everything lives in one project, `Fort.ind UWP\`:

| folder / file | what's there |
|---|---|
| `App.xaml.vb` | kind of the home of this entire app, and handling the `fortind://` protocol callback |
| `AppConstants.vb` | shared string constants (nav tags, settings keys, search config, etc.) |
| `MainPage.xaml(.vb)` | this is the actual ui that you would see upon launching the app |
| `Pages\` | `LoginPage` and `ProfilePage` these are the only 2 with their own seprate pages |
| `Models\` | `SearchItem`, `UserProfile` |
| `Services\` | `LocalStorageService`, `ProfileService`, `MisskeyAuthService`, `SitemapService`, `LiveTileService` |
| `Assets\` | icons, tiles, splash images |
| `Package.appxmanifest` | app identity, capabilities, protocol registration, tile config |
| `sitemap.xml` | bundled snapshot of the fort1nd.com sitemap for in-app search |
| `scripts\Install.ps1` | install script to save you like.. 10 seconds? |

## how to add something

There's no MVVM and no DI here on purpose - keep new code consistent with that:

- New functionality generally goes into a **static service class** in `Services\`, called directly from a page's code-behind
- If you're adding a new nav section, follow the pattern in `MainPage.xaml.vb`'s `ShowContent` method - most sections are just panels toggled by visibility; only add a "real" page if you genuinely need frame-based navigation like Profile does 
- If your feature should show up in search, add entries via `SitemapService`/`SearchItem` rather than inventing a separate search mechanism since fort.uwp merges this with its own sitemap.xml 

## design guidelines

The uwp repo has a `docs\windows10-uwp-design-guidance.md` file that's worth a read before touching XAML - it exists specifically to keep the UI looking authentically Windows 10 / WinUI 2 (acrylic, Reveal, Segoe MDL2 icons, Win10-era corner radii and type ramp) instead of drifting toward a Windows 11 / Fluent 2 look.

## what's still a placeholder (good places to help)

- **Games** and **Social** are just links out to the website right now, we dont have a functional API for this yet

If you want to pick something up, the in-app About section links to the GitHub repo and issue tracker - that's the best place to check what's already being worked on.
