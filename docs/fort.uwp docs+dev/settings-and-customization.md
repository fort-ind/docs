---
sidebar_position: 5
---
# settings & customization

Settings isn't a separate page - it's an inline panel in `MainPage`, made of five collapsible rows: **Appearance**, **Data Storage**, **Live Tile**, **Welcome Dialog**, and **about**. Everything here is backed by `ApplicationData.LocalSettings`, so it's per-user, per-machine, and wiped if you uninstall the app.

## appearance

### theme

Three options - **System default**, **Light**, **Dark** - saved under the `AppTheme` key.

Applying a theme sets `RequestedTheme` on the **root `Frame`**, not on the app. since: `Application.RequestedTheme` can only be set before the app's first frame exists, so changing it at runtime would need a restart. Setting it on the root frame flows down to everything and takes effect instantly.

Changing the theme also triggers two follow-ups:

- the custom title bar colours get recalculated (`UpdateTitleBarColors`)
- the tint colour is re-applied, because each tint has separate light/dark shades (see below)

### accent tint

Six swatches: **Default**, Blue, Purple, Green, Red annd the og color scheme that we used. The value saved under `AppTintColor` is the actual hex string used as the button's `Tag` (or `"Default"`).

Picking anything other than Default builds a new `AcrylicBrush` at runtime and assigns it to `RootGrid.Background`. Picking Default restores the original `AppAcrylicBrush` resource from XAML.

The interesting bit is that each tint is really *two* colours (woah shocking):

| swatch | dark theme | light theme |
|---|---|---|
| Blue | `#1E3A5F` | `#C8E0F5` |
| Purple | `#2D1B69` | `#DDD0F5` |
| Green | `#0F3D2E` | `#C5E8D5` |
| Red | `#3D1515` | `#F5CECE` |
| fort.inds og color :3 | `#1A1A2E` | `#D0D0EA` |

The dark hex is what's stored; when the effective theme is light, `s_lightTintMap` swaps in the pale equivalent. Tint opacity changes too - **0.8** in dark, **0.6** in light - since the same opacity over a light backdrop washes out completely. `TintLuminosityOpacity` stays at 0.85 either way.

"Effective theme" here means: if the frame is set to `Default`, fall back to checking `Application.Current.RequestedTheme`, otherwise use the frame's value. That check shows up in a few places because `ElementTheme.Default` doesn't tell you *which* theme you actually got.

The selected swatch is marked with a border that's white in dark mode and black in light mode, which is why switching themes also refreshes the selection highlight.

:::note
The acrylic uses `HostBackdrop`, meaning it samples your desktop wallpaper behind the window, not the app's own content. If transparency effects are off in Windows Settings, the `FallbackColor` (the flat tint colour) is used instead.
:::

## data storage

Read-only info plus one destructive button:

- **Location** - the app's local folder path, from `LocalStorageService.DataPath`
- **Status** - whether you're logged in, and as who (`@username@social.fort1nd.com`)
- **Clear login info** - only visible while logged in 

Clearing login info shows a confirmation dialog first, then calls `ProfileService.LogoutAsync` - which drops the token from the Credential Vault and deletes the cached profile JSON. Worth knowing: this **doesn't deauthorize the app on fort.social's side**. The dialog says so, and the app can't do it itself since it only holds `read:account`. To fully revoke, go to fort.social → profile → service integration and unlink there. See [sign-in & accounts](./sign-in-and-accounts.md).

## live tile

Two buttons:

- **Refresh** - re-runs `UpdateLiveTile()`, pushing the current news content back onto the tile in case if its fucked up
- **Clear** - calls `LiveTileService.ClearTile()` *and* `ClearBadge()`, clearing the live tile to just be the app logo

These exist mostly because live tiles are easy to get into a fucked state, and because there's no other way to force an update without relaunching.

## welcome dialog

The first-run dialog has a "dont show me this again" checkbox that writes `HideWelcomeDialog = True`. This row's button flips it back to `False` and immediately re-shows the dialog, so it's both a reset and a preview.

The dialog itself is built in code rather than XAML - three Segoe MDL2 icons, the beta blurb, and the checkbox.

All dialogs in `MainPage` go through a shared `SemaphoreSlim` with `WaitAsync(0)`, so a second dialog attempt while one is open just returns instead of throwing. UWP only permits one `ContentDialog` at a time and will otherwise raise an exception.

## about

Shows the version string from `AppConstants.AppVersionDisplay` and links out to the site, the GitHub repo, and the issue tracker.

The version is read from the **package manifest** at runtime (`Package.Current.Id.Version`, formatted `Major.Minor.Build`) rather than being hardcoded, so the About screen can't drift from what CI actually built. There's a hardcoded fallback for the unpackaged case, and a `VersionChannel` suffix constant if you want to append something like "Beta".

## how the rows work

Each row is a header you tap to expand, with a chevron that rotates 0° → 90°. Expanded state is persisted per row:

| row | LocalSettings key |
|---|---|
| Appearance | `SettingsAppearanceExpanded` |
| Data Storage | `SettingsStorageExpanded` |
| Live Tile | `SettingsTileExpanded` |
| Welcome Dialog | `SettingsWelcomeExpanded` |
| About | `SettingsAboutExpanded` |

`RestoreSettingsPanelStates` runs at startup and reapplies all five. Rows with no saved key keep their XAML default, so a fresh install isn't forced into a particular layout.

## the `_loadingSettings` flag

Worth understanding before you add a setting. `LoadAppearanceSettings` sets `_loadingSettings = True` while restoring state, because assigning `IsChecked` on a radio button *fires its `Checked` handler* - which would immediately write the value back to `LocalSettings` and, worse, could clobber a saved value with a default during startup. (not fun)

So the pattern for any new setting is:

- the handler early-returns (or skips its save) when `_loadingSettings` is `True`
- the restore path is wrapped in `Try`/`Finally` so the flag always gets cleared

`ApplyTheme` and `ApplyTintColor` both follow this - they apply the visual change unconditionally, but only persist when the flag is clear.

## adding a setting

1. Add a key constant to `AppConstants.vb` - don't inline the string, the whole file exists to stop that drift
2. Add the control to the relevant row in `MainPage.xaml`
3. Write an apply method that guards its save with `_loadingSettings`
4. Restore it in `LoadAppearanceSettings`
5. Add `SearchItem` entries so it's findable - see [search](./search.md)
