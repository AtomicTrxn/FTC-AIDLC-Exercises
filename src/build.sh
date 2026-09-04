#!/usr/bin/env bash
# Regenerate every deliverable from the markdown sources.
#
#   ./build.sh
#
# Sources of truth live in this folder as .md. Everything in the parent
# folder is generated output and should never be edited by hand.

set -euo pipefail
cd "$(dirname "$0")"

OUT="${OUT:-..}"
export NODE_PATH="${NODE_PATH:-$(npm root -g)}"   # docx is installed globally

echo "building worksheet…"
node render.js worksheet.md \
  --docx "$OUT/Arm Bolt Worksheet.docx"

# ---- the GitHub Pages site ----
SITE="${SITE:-../docs}"
mkdir -p "$SITE/assets"

echo "building interactive worksheet…"
node render.js worksheet.md \
  --web "$SITE/worksheet-arm-bolt.html" \
  --doc-id arm-bolt

echo "building landing page…"
node site.js site-manifest.json "$SITE/index.html"

cp assets/worksheet.js "$SITE/assets/worksheet.js"
touch "$SITE/.nojekyll"

echo
echo "done. generated:"
echo "  $OUT/Arm Bolt Worksheet.docx"
echo "  $SITE/index.html                    (GitHub Pages site)"
echo "  $SITE/worksheet-arm-bolt.html       (interactive, saves locally)"
