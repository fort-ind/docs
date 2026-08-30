---
sidebar_position: 8
---
# contributing

## project layout

Everything lives in the `Fort.ind UWP` folder

| folder / file | what's there |
|---|---|
| `App.xaml(.cs)` | kind of the home of this entire app |
| `AppConstants.cs` | shared constants ONLY (nav tags, settings keys, timings) - never inline these |
| `Assets\` | icons, tiles, splash images, and `sitemap.xml` for in-app search |
| `Helpers\` | small little helpers - `ColorHelper`, `Debouncer`, `LocalizedStrings`, `VisualTreeSearch`, `WebLauncher` |
| `Models\` | `SearchItem`, `GameGroup`, `UserProfile` |
| `Services\` | static "service" classes see the table below |
| `Strings\en-US\Resources.resw` | every display string in the app (see Localization below) |
| `Views\` | `MainPage` (split into several files, see below), `GamesPage`, `LoginPage`, `ProfilePage` - these are the pages you'd actually see |
| `Package.appxmanifest` | app identity, capabilities, protocol registration, tile config |
| `scripts\Install.ps1` | install script to save you like.. 10 seconds? |

## how to add something

There's no MVVM and no DI here on purpose - keep new code consistent with that:

- New functionality generally goes into a static service class in `Services\`, called directly from a page's code-behind
- If you're adding a new nav section, follow the pattern in `MainPage.Navigation.cs`'s `ShowContent` method - most sections are just panels toggled by visibility; only add a "real" page (like `GamesPage`/`ProfilePage`) if you genuinely need frame-based navigation, e.g. a bounded-height control like `SemanticZoom` that an inline `ScrollViewer` can't give you
- If your feature should show up in search, add entries via `SearchCatalog`/`SearchItem` rather than inventing a separate search mechanism - see [search](./search.md)
- **Never hardcode a display string.** Every bit of user-visible text should live in /strings/ this is for localization purpouses :) 

A few other things

- The C# language version is pinned to **7.3** 
 - no switch expressions, `using` declarations, nullable reference types, or records. It can pass a Debug build and misbehave under Release's compiler toolchain.
- Every `ContentDialog` goes through `DialogService` rather than `new ContentDialog()` + `ShowAsync()` directly, so only one can ever be open
- Every `async void` method is fully wrapped in `try`/`catch` - an unhandled exception in one crashes the app outright.

## design guidelines

This app should look like a Windows 10-era app, so refer to Microsoft's docs, use Fluent Design guidelines + Segoe MDL2 icons, and also make sure the design is accessible and is well thought :p

## what's still a placeholder (good places to help out!)

- **Social** just links out to the website right now; we dont have a functional API for that yet

If you want to pick something up, head to the GitHub repo - that's the best place to check what's already being worked on. or what needs fixing
