---
sidebar_position: 5
---
# settings & customization

Settings isn't a separate page - it's an inline panel in `MainPage`, made of five collapsible rows: **Appearance**, **Data Storage**, **Live Tile**, **Welcome Dialog**, and **About**. Everything here is backed by `ApplicationData.LocalSettings`, so it's per-user, per-machine, and wiped if you uninstall the app. The code lives split across `Views\MainPage.Appearance.cs` and `Views\MainPage.Settings.cs`.

## appearance

### theme

Three options - **System default**, **Light**, **Dark** - saved under the `AppTheme` key.

Applying a theme sets `RequestedTheme` on the **root frame**, not on the app. since: `Application.RequestedTheme` can only be set before the app's first frame exists, so changing it at runtime would need a restart. Setting it on the root frame flows down to everything and takes effect instantly.

Changing the theme also triggers two follow-ups:

- the custom title bar colours get recalculated (`UpdateTitleBarColors`)
- the tint colour is re-applied, because each tint has separate light/dark shades (see below)

### accent tint

Eleven swatches: **Default**, plus ten named presets - Blue, Purple, Green, Red, Slate, Teal, Bronze, Rose, Olive, and Graphite - and a **custom** swatch that opens a full colour picker. The value saved under `AppTintColor` is the actual hex string used as the button's `Tag` (or `"Default"`).

Picking anything other than Default builds a new `AcrylicBrush` at runtime and assigns it to `RootGrid.Background`. Picking Default restores the untinted window acrylic. There's only ever **one** `AcrylicBrush` instance for this, repainted in place rather than rebuilt per pick - a `HostBackdrop` brush is backed by a composition effect sampling the desktop, so rebuilding it on every colour-picker drag would be the most expensive thing the appearance code does.

The interesting bit is that each preset is really *two* colours (woah shocking):

| swatch | dark theme | light theme |
|---|---|---|
| Blue | `#1E3A5F` | `#C8E0F5` |
| Purple | `#2D1B69` | `#DDD0F5` |
| Green | `#0F3D2E` | `#C5E8D5` |
| Red | `#3D1515` | `#F5CECE` |
| Slate (fort.ind's og colour :3) | `#1A1A2E` | `#D0D0EA` |
| Teal | `#0E3A3A` | `#C5E8E8` |
| Bronze | `#3D2A0F` | `#F5E3C0` |
| Rose | `#3D1533` | `#F5CEE9` |
| Olive | `#2E3D0F` | `#DEEBC0` |
| Graphite | `#232323` | `#DCDCDC` |

The dark hex is what's stored; when the effective theme is light, a lookup table swaps in the pale equivalent. Tint opacity changes too - **0.8** in dark, **0.85** in light for a coloured tint (the untinted Default is 0.8 in both) - since the same opacity over a light backdrop washes out completely otherwise.

"Effective theme" here means: if the frame is set to `Default`, fall back to checking `Application.Current.RequestedTheme`, otherwise use the frame's value. That check shows up in a few places because `ElementTheme.Default` doesn't tell you *which* theme you actually got.

### custom tint

The eleventh swatch opens a `ColorPicker` dialog (hex input included!) seeded with whatever colour was last picked - either your last custom colour, or the current preset's dark hex if you're switching from a preset. Dragging the picker previews the tint live against the window in real time via the picker's `ColorChanged` event; cancelling restores whatever tint was active before you opened the dialog. Confirming saves the hex under `AppCustomTintColor` and it becomes the new `AppTintColor`.

The selected swatch is marked with a border that's white in dark mode and black in light mode, which is why switching themes also refreshes the selection highlight.

:::note
The acrylic uses `HostBackdrop`, meaning it samples your desktop wallpaper behind the window, not the app's own content. If transparency effects are off in Windows Settings, the `FallbackColor` (the flat tint colour) is used instead.
:::

## data storage

Read-only info plus one destructive button:

- **Location** - the app's local folder path, from `LocalStorageService.DataPath`
- **Status** - whether you're logged in, and as who (`@username@social.fort1nd.com`)
- **Clear login info** - only visible while logged in

Clearing login info shows a confirmation dialog first, then calls `ProfileService.LogoutAsync` - which drops the token from the Credential Vault and deletes the cached profile JSON (and pops a "Signed out, goodbye!" toast). Worth knowing: this **doesn't deauthorize the app on fort.social's side**. The dialog says so, and the app can't do it itself since it only holds `read:account`. To fully revoke, go to fort.social → profile → service integration and unlink there. See [sign-in & accounts](./sign-in-and-accounts.md).

### reset app

Next to Clear login info is a **Reset app** button, it's the more destructive of the two. Where "clear login info" only touches your account session, this wipes *everything* the app has ever written locally: the auth token, the cached profile, the sitemap cache, the cached avatar image, and every `LocalSettings` value - theme, tint, panel-expanded states, the welcome-dialog flag, all of it. It leaves the app in the same state as a fresh install. Like clear login info, **it has no effect on your fort.social account itself.**

Because that's irreversible, it's gated behind 2 separate confirmations rather than one:

1. An explainer dialog describing what gets deleted
2. A final "are you REALLYYYY sure" dialog with no way back after this point

Once the wipe runs (`ProfileService.ResetAppDataAsync` → `LocalStorageService.ResetAllAppDataAsync`, which deletes everything in the local folder and clears `LocalSettings.Values` outright), the appearance settings are immediately reloaded from those now-empty defaults and a third dialog offers to restart the app right away via `CoreApplication.RequestRestartAsync`. A restart isn't strictly required - the reset already applied to this running session - but it's offered because a handful of things are only guaranteed consistent after a fresh process start.

## accessibility

Every settings row header and the tint swatches carry `AutomationProperties.Name`/`HelpText`, so a screen reader announces what a row does before it's expanded, not just its label. The tint swatches take this further: since the selected swatch is otherwise only indicated by a border color, the selected swatch's automation name gets a " (selected)" suffix appended at runtime - a sighted user sees the highlight, a screen reader user gets the equivalent via the announced name.

## live tile

Three controls:

- **Refresh** - re-runs the live tile update, pushing the news content back onto the tile in case if its fucked up
- **Clear** - clears the live tile back to just the app logo, and clears the taskbar badge too
- **Show taskbar badge** toggle - turns the little notification badge on the taskbar icon on or off (`ShowTileBadge`, defaults on). Turning it off immediately clears any badge that's currently showing.

These exist mostly because live tiles are easy to get into a fucked state, and because there's no other way to force an update without relaunching.

## welcome dialog

The first-run dialog has a "dont show me this again" checkbox that writes `HideWelcomeDialog = True`. This row's button flips it back to `False` and immediately re-shows the dialog, so it's both a reset and a preview.

The dialog itself is built from a `DataTemplate` stamped fresh on every show (a reused `ContentDialog` instance stops replaying its entrance animation) - three Segoe MDL2 icons, the beta blurb, and the checkbox.

All dialogs in the app go through a shared `DialogService`, which owns one process-wide `SemaphoreSlim` gate, so a second dialog attempt while one is open just returns instead of throwing. UWP only permits one `ContentDialog` at a time and will otherwise raise an exception.

## about

Shows the version string from `AppConstants.AppVersionDisplay` and links out to the site, the GitHub repo, and the GitHub issues page.

The version is read from the package manifest at runtime (`Package.Current.Id.Version`, formatted `Major.Minor.Build`) rather than being hardcoded, so the About screen can't drift from what CI actually built. There's a hardcoded fallback for the unpackaged case, and a `VersionChannel` suffix constant if you want to append something like "Beta".

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

Worth understanding before you add a setting. `LoadAppearanceSettings` sets `_loadingSettings = true` while restoring state, because assigning `IsChecked` on a radio button *fires its `Checked` handler* - which would immediately write the value back to `LocalSettings` and, worse, could clobber a saved value with a default during startup. (not fun)

So the pattern for any new setting is:

- the handler early-returns (or skips its save) when `_loadingSettings` is `true`
- the restore path is wrapped in `try`/`finally` so the flag always gets cleared

`ApplyTheme` and `ApplyTintColor` both follow this - they apply the visual change unconditionally, but only persist when the flag is clear.

## adding a setting

1. Add a key constant to `AppConstants.cs` - don't inline the string, the whole file exists to stop that drift
2. Add the control to the relevant row in `MainPage.xaml`, with an `x:Uid` if it shows any text - display strings live in `Strings\en-US\Resources.resw`, not inline (see [contributing](./contributing.md))
3. Write an apply method that guards its save with `_loadingSettings`
4. Restore it in `LoadAppearanceSettings`
5. Add `SearchItem` entries so it's findable - see [search](./search.md)
