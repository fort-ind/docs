---
sidebar_position: 6
---
# building it

## prerequisites

- **Visual Studio 2022**, with the **"Universal Windows Platform development"** workload installed (this pulls in the Windows 10 SDK and the UWP/XAML build tools)
- Windows 10 SDK **10.0.19041.0** (the project also supports down to 10.0.17763.0, i.e. Windows 10 1809)
- That's it as far as SDKs go - no extra NuGet stuff, no secrets/config files needed to build locally

:::note
This is a legacy-style UWP project, not an SDK one - **`dotnet build` won't work here**. You need MSBuild with the UWP/XAML targets, which only exist with Visual Studio.
:::

## opening & building

1. Open `Fort.ind UWP.sln` in Visual Studio
2. Pick a Platform (x86/x64/ARM/ARM64) and Configuration (Debug/Release) from the toolbar
3. Build with Ctrl+Shift+B - NuGet restore happens automatically

If you'd rather build from the command line (this is basically what CI does):

```
msbuild "Fort.ind UWP.sln" /t:Restore /p:Configuration=Release /p:Platform=x64 /p:VisualStudioVersion=17.0
msbuild "Fort.ind UWP\Fort.ind UWP.vbproj" /p:Configuration=Release /p:Platform=x64 /p:VisualStudioVersion=17.0 /p:GenerateAppxPackageOnBuild=true /restore
```

## running & debugging

Just hit F5 in Visual Studio with a platform matching your machine (x64 is the common case) - it'll deploy and attach the debugger for you. A couple of things to know:

- You'll need **Developer Mode** (or "Sideload apps") turned on in Windows Settings → Update & Security → For developers - VS will prompt you if it's off
- ARM/ARM64 builds need an actual ARM device or a remote machine to deploy to, since there's no ARM emulator for a typical x64 dev box

## packaging & signing

The project is set up to sign packages with a test certificate (`Fort.ind UWP_TemporaryKey.pfx`), but that file isn't committed - Visual Studio will generate one for you automatically the first time you build a package locally.

For end users, installing a built package means:

1. Install the exported `.cer` certificate - into **Trusted People**, not Trusted Root
2. Run the `.msix`/`.appx`, or just run the included `scripts\Install.ps1` as admin, which handles the cert, VCLibs/WinUI runtime dependencies, and enabling sideloading all in one go

CI (`.github/workflows/build-msix.yml`) builds x86/x64/ARM64 release packages on every push, versioning from git tags (`v*`) when present. Tagged builds are signed using a certificate stored in GitHub secrets and get drafted into a GitHub Release; regular PR builds are built unsigned.
