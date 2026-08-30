---
sidebar_position: 4
---
# search

The search box at the top of the nav pane searches three things at once: the app's own nav/settings items, your fort.social profile (if you're signed in), and a bundled snapshot of the fort1nd.com sitemap. This page covers how that actually works, based on `Services\SearchCatalog.cs`, `Services\SitemapService.cs`, `Models\SearchItem.cs`, and the search handlers in `Views\MainPage.Search.cs`.

There's also a second, separate filter box on the [Games](./how-it-works.md) page for narrowing down the games list once you're already there - that one's simpler (instant substring filtering, no debounce wackadoos)

## shortcuts

- **Ctrl+F** starts a search.. what else would it do..
- **Esc** clears it (only when it has text in it)
- **Enter** without picking a suggestion jumps to the first match

## what gets searched

Everything is a `SearchItem` - a title, a category, and then *either* a `NavigationTag` (for in-app stuff) or a `Url` (for site pages). That's the whole model, and it's what makes one search box able to do both jobs.

There are three sources:

1. **Static items** - `SearchCatalog.StaticItems`, a hardcoded array. This covers nav destinations (home, games, betas, profile, social, settings) plus a bunch of *settings* entries, so typing "dark mode" or "background tint" takes you to Settings instead of turning up nothing. About no longer has its own entry here - it's reachable only as a row inside Settings now, not as a separate nav destination. (beacuse having 2 about pages is really fuckin dumb)
2. **Sitemap items** - every URL in the bundled `Assets\sitemap.xml`, loaded asynchronously on startup and merged into the static list once ready. Search works before this finishes, you just won't get site results yet.
3. **Your profile** - if you're signed in, a `Profile: {your display name}` entry is generated at query time rather than being stored in the list

## how a query is matched

Matching is deliberately simple - a case-insensitive **substring** check against both the title *and* the category, done in `SearchCatalog.BuildSuggestions`:

```csharp
item.Title.IndexOf(query, StringComparison.OrdinalIgnoreCase) >= 0 ||
item.Category.IndexOf(query, StringComparison.OrdinalIgnoreCase) >= 0
```

Results come back in list order, which means static nav/settings items always appear before sitemap results - that's intentional, since "Settings" should beat some random page that happens to contain the word.

Because categories are matched too, typing `emulators` gets you every page under that category even if none of them have "emulators" in their title.

Two constants in `AppConstants.cs` control the behaviour:

| constant | value | what it does |
|---|---|---|
| `SearchDebounceMilliseconds` | 300 | how long you have to stop typing before a search runs |
| `SearchSuggestionLimit` | 15 | max suggestions shown |

The limit is applied *while* filtering, not after - it stops scanning the moment it has 15 matches, so a query like "h" doesn't walk the entire sitemap.

## debouncing & threading

Every keystroke cancels the previous pending search via a `Debouncer` helper (`Helpers\Debouncer.cs`), then starts a new one that waits 300ms before doing anything. If you're still typing, that wait gets cancelled and nothing runs.

Once the delay is done the actual filtering happens **off the UI thread** (`Task.Run`) and the results are only assigned back if the token still hasn't been cancelled. Volatile references (`_allSearchItems`, `ProfileService.CurrentUser`) are captured on the UI thread *before* going off-thread. It's a bit more ceremony than a search box normally needs, but it keeps typing smooth even with a few thousand sitemap entries loaded.

`OperationCanceledException` is swallowed silently here - it's the expected outcome of typing quickly, not an error.

## the sitemap

`SitemapService.LoadSearchItemsAsync` is what turns `sitemap.xml` into search results cool right?

### caching

The parse result is cached so it isn't redone on every launch:

- Cache file: `sitemap_urls.cache` in the app's local folder - just one URL per line, not XML
- Timestamp: stored in `LocalSettings` under `SitemapCacheUnixSeconds`
- App version the cache was built with: stored under `SitemapCacheAppVersion`
- TTL: **24 hours** (`SitemapCacheTtlHours`)

On startup it checks the timestamp *and* the stored app version first. If the cache is present, fresh, and was built by the version of the app currently running, the URLs are read straight from that file and the XML never gets parsed. If it's missing, stale, from a different app version, empty, or the timestamp is unreadable, it falls back to parsing `ms-appx:///Assets/sitemap.xml` and rewrites the cache afterwards.

:::note
The sitemap is a **bundled snapshot** so sometimes it can be out of date untill we put a new sitemap.xml in a release
:::

fucked up XML is handled by returning an empty list rather than throwing, so a bad sitemap degrades search to "nav items only" instead of breaking the app.

### titles

Display names come from the **last path segment**, with dashes and underscores split into words and title-cased:

```
/games/html/explosion  →  "Explosion"
```

A few special cases make this less dumb-looking for real things:

- Known acronyms are kept fully uppercase instead of title-cased - things like `html`, `gba`, `snes`, `n64`, `nfl`, `tmnt`, `fnaf` etc. come out as `HTML`, `GBA`, `SNES`, `N64`, `NFL`, `TMNT`, `FNAF` rather than `Html`/`Gba`
- A trailing domain-style token (`com`, `net`, `io`, `gg`, `lol`, `org`) gets joined with a dot instead of a space, so `some-game-io` becomes "Some Game.io" instead of "Some Game Io"
- Two consecutive numeric tokens get joined with a dot too, mimicking a version number - `game-2-0` becomes "Game 2.0" instead of "Game 2 0"

So the titles you see in search are taken from the name that was given on the website, not authored in the app - if a page shows up with an odd name, the fix is the URL slug on the website (or, for a genuinely weird case, the token lists in `SitemapService.GetTitle`).

Two special cases: the site root becomes `Home`, and `/404` is skipped entirely.

### categories

Category comes from the URL prefix, checked most-specific-first:

| path starts with | category |
|---|---|
| `games/html/` | Games — HTML |
| `games/flash/` | Games — Flash |
| `games/codepen/` | Games — CodePen |
| `games/retroclassic-mostly-emulated/` | Games — Retro |
| `games/minecraft/` | Games — Minecraft |
| `games/` | Games |
| `social/` | Social |
| `emulators/` | Emulators |
| `apps/appstone/` | Apps — AppStone |
| `apps/` | Apps |
| `extras/` | Extras |
| `labs-betas/` | Labs & Betas |
| anything else | fort1nd.com |

Order matters here - `games/html/` has to be tested before `games/`, or everything would collapse into the generic "Games" bucket.

### icons

Each result gets a Segoe MDL2 glyph picked from its category in `SearchItem`'s constructor - gear for Settings, person for Profile, play button for anything starting with "Games", beaker for Labs & Betas, globe as the fallback. Note that the Games and Apps cases use `StartsWith`, which is what lets the sub-categories above ("Games — Flash" etc.) inherit the right icon for free.

## picking a result

`NavigateToSearchItem` (in `MainPage.Search.cs`) branches on which field is populated:

- has a **`Url`** → validated and opened in your default browser via `WebLauncher.LaunchAsync` (which only accepts http/https - see [contributing](./contributing.md))
- has a **`NavigationTag`** → `ShowContent(tag)`, navigating in-app

So site results leave the app and nav results don't. There's no in-app browser beacuse then ram usage would skyrocket
and most sites dont play nice with edgeHTML anyway-

## adding to search

If you're adding a feature that should be findable, add `SearchItem` entries to `SearchCatalog` rather than building a second search mechanism - see [contributing](./contributing.md). In practice:

- **new nav section** → add a static entry with the matching `NavigationTag`
- **new settings control** → add entries pointing at `NavigationSettings`, and add a couple of synonyms while you're there (the existing list has both "Theme" and "Dark Mode"/"Light Mode" for exactly this reason)
- **new site pages** → nothing to do in code, but the bundled `Assets\sitemap.xml` needs updating for them to appear
