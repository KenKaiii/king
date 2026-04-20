#!/usr/bin/env bash
# Generate macOS .icns + Windows .ico + 512 PNG from a single SVG source.
#
# macOS icon guidelines (Big Sur+):
#   - 1024x1024 canvas, content inset 100px each side (= 824x824 squircle body)
#   - Shape: superellipse / "squircle". We approximate with rounded-rect rx=185
#     (visually indistinguishable to ~2 px at corners from a true superellipse).
#   - iconutil generates multi-resolution .icns from a compliant .iconset dir
#     (16, 16@2x, 32, 32@2x, 128, 128@2x, 256, 256@2x, 512, 512@2x).
#
# Windows .ico: multi-size 16/24/32/48/64/128/256 in a single file, built with
# ImageMagick.
#
# Requires: rsvg-convert, sips, iconutil, magick (ImageMagick 7).
#
# Output: build/icon.icns, build/icon.ico, build/icon.png

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUILD_DIR="$ROOT/build"
# The brand heading font (Rocaone Black) is the same face used for every title
# in the app. It ships as .woff2; ImageMagick/FreeType can't read woff2, so we
# decompress it to a .ttf in tmp using fontTools before rendering.
FONT_SRC="$ROOT/src/renderer/src/assets/fonts/rocaone/RocaOne-Black.woff2"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
FONT="$TMP/rocaone-black.ttf"

mkdir -p "$BUILD_DIR"

python3 -c "from fontTools.ttLib import TTFont; f=TTFont('$FONT_SRC'); f.flavor=None; f.save('$FONT')"

# ----- 1. Build source SVG (1024x1024) -----
# Squircle body: inset 100 from 1024 canvas, rx=185 (macOS Big Sur spec).
# Background: warm pastel gradient (shell → blush) matching brand palette.
cat >"$TMP/icon.svg" <<'SVG'
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <radialGradient id="bg" cx="0.5" cy="0.35" r="0.85">
      <stop offset="0"    stop-color="#fff8e0"/>
      <stop offset="0.55" stop-color="#fff1b8"/>
      <stop offset="1"    stop-color="#ffcbd6"/>
    </radialGradient>
    <linearGradient id="stroke" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#7a4432" stop-opacity="0.35"/>
      <stop offset="1" stop-color="#33201a" stop-opacity="0.55"/>
    </linearGradient>
    <filter id="innerShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="12"/>
      <feOffset dx="0" dy="6" result="off"/>
      <feComposite in="off" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="innerShadow"/>
      <feColorMatrix in="innerShadow" values="0 0 0 0 0.2  0 0 0 0 0.1  0 0 0 0 0.08  0 0 0 0.25 0"/>
    </filter>
  </defs>
  <!-- Squircle body: rounded-rect approximation (rx/ry=185) inset 100 from edge. -->
  <rect x="100" y="100" width="824" height="824" rx="185" ry="185" fill="url(#bg)"/>
  <rect x="100" y="100" width="824" height="824" rx="185" ry="185" fill="none" stroke="url(#stroke)" stroke-width="6"/>
  <rect x="100" y="100" width="824" height="824" rx="185" ry="185" fill="#000" opacity="0.08" filter="url(#innerShadow)"/>
</svg>
SVG

# ----- 2. Rasterize SVG → base 1024 PNG -----
rsvg-convert -w 1024 -h 1024 "$TMP/icon.svg" -o "$TMP/base.png"

# ----- 3. Overlay the brand "K" letter using Rocaone Black (heading font) -----
# Uses ImageMagick to compose crisp anti-aliased text from TTF. Rocaone Black
# has large built-in side/top bearings, so the glyph sits visually high inside
# its em-box — we nudge slightly *down* to optically centre it.
magick "$TMP/base.png" \
  -font "$FONT" \
  -fill "#33201a" \
  -pointsize 700 \
  -gravity center \
  -annotate +0+40 "K" \
  "$TMP/icon-1024.png"

# ----- 4. Generate macOS .icns -----
# Required sizes in an .iconset directory:
#   icon_16x16.png, icon_16x16@2x.png, icon_32x32.png, icon_32x32@2x.png,
#   icon_128x128.png, icon_128x128@2x.png, icon_256x256.png, icon_256x256@2x.png,
#   icon_512x512.png, icon_512x512@2x.png
ICONSET="$TMP/icon.iconset"
mkdir -p "$ICONSET"

sips -z 16   16   "$TMP/icon-1024.png" --out "$ICONSET/icon_16x16.png"       >/dev/null
sips -z 32   32   "$TMP/icon-1024.png" --out "$ICONSET/icon_16x16@2x.png"    >/dev/null
sips -z 32   32   "$TMP/icon-1024.png" --out "$ICONSET/icon_32x32.png"       >/dev/null
sips -z 64   64   "$TMP/icon-1024.png" --out "$ICONSET/icon_32x32@2x.png"    >/dev/null
sips -z 128  128  "$TMP/icon-1024.png" --out "$ICONSET/icon_128x128.png"     >/dev/null
sips -z 256  256  "$TMP/icon-1024.png" --out "$ICONSET/icon_128x128@2x.png"  >/dev/null
sips -z 256  256  "$TMP/icon-1024.png" --out "$ICONSET/icon_256x256.png"     >/dev/null
sips -z 512  512  "$TMP/icon-1024.png" --out "$ICONSET/icon_256x256@2x.png"  >/dev/null
sips -z 512  512  "$TMP/icon-1024.png" --out "$ICONSET/icon_512x512.png"     >/dev/null
cp "$TMP/icon-1024.png" "$ICONSET/icon_512x512@2x.png"

iconutil -c icns "$ICONSET" -o "$BUILD_DIR/icon.icns"

# ----- 5. Generate Windows .ico (multi-size) -----
# 16, 24, 32, 48, 64, 128, 256 in one .ico file.
magick "$TMP/icon-1024.png" \
  -define icon:auto-resize=256,128,64,48,32,24,16 \
  "$BUILD_DIR/icon.ico"

# ----- 6. 512 PNG fallback (used by Linux builds + electron-builder default) -----
sips -z 512 512 "$TMP/icon-1024.png" --out "$BUILD_DIR/icon.png" >/dev/null

echo ""
echo "✓ Generated:"
ls -lh "$BUILD_DIR/"
