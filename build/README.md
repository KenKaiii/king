# Build Resources

electron-builder looks in this directory for icons and other platform-specific assets.

## Required files

Place the following files here before building a release:

- **`icon.icns`** — macOS app icon (1024×1024 source, multi-size icns). Used for the `.app` and `.dmg`.
- **`icon.ico`** — Windows app icon (multi-size ico: 16, 24, 32, 48, 64, 128, 256). Used for the installer + exe.
- **`icon.png`** _(optional)_ — 512×512 PNG. Used as a fallback for Linux builds or if icns/ico are missing.

## Recommended workflow

1. Design a single square PNG at 1024×1024 (transparent background).
2. Generate platform variants:
   - macOS `.icns`: use [iconutil](https://developer.apple.com/library/archive/documentation/GraphicsAnimation/Conceptual/HighResolutionOSX/Optimizing/Optimizing.html) or an online converter
   - Windows `.ico`: use [ImageMagick](https://imagemagick.org/) or an online converter
3. Drop both files into this directory.

If icons are missing, electron-builder will warn and fall back to the default Electron icon — the build will still succeed.

## Optional files

- **`background.png`** — macOS DMG background image (540×380 recommended)
- **`entitlements.mac.plist`** — custom entitlements for macOS hardened runtime (only needed for code signing + notarization)
