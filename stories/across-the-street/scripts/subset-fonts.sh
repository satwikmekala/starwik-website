#!/usr/bin/env bash
# Subsets the official OFL font sources (fonts/source/**) into small woff2
# files served from public/, and ships each family's OFL.txt beside them.
# Requires fontTools + brotli:  python3 -m pip install fonttools brotli
set -euo pipefail
HERE="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$HERE/../../public/stories/across-the-street/fonts"
PY="${PYTHON:-python3}"
mkdir -p "$OUT"
# Basic Latin, Latin-1 punctuation, typographic quotes/dashes, ellipsis, arrows.
UNICODES="U+0020-007E,U+00A0-00FF,U+2013-2014,U+2018-201A,U+201C-201E,U+2022,U+2026,U+2190-2193"
sub() { "$PY" -m fontTools.subset "$1" --unicodes="$UNICODES" --layout-features='kern,liga,calt,ss01' \
  --flavor=woff2 --no-hinting --desubroutinize --output-file="$OUT/$2"; }
sub "$HERE/fonts/source/bdo-grotesk/BDOGrotesk-Regular.ttf"          bdo-grotesk-regular.woff2
sub "$HERE/fonts/source/bdo-grotesk/BDOGrotesk-Medium.ttf"           bdo-grotesk-medium.woff2
sub "$HERE/fonts/source/instrument-serif/InstrumentSerif-Italic.ttf" instrument-serif-italic.woff2
cp "$HERE/fonts/source/bdo-grotesk/OFL.txt"      "$OUT/BDO-Grotesk-OFL.txt"
cp "$HERE/fonts/source/instrument-serif/OFL.txt" "$OUT/Instrument-Serif-OFL.txt"
ls -l "$OUT"
