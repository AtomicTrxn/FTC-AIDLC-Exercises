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
export NODE_PATH="${NODE_PATH:-$HOME/.npm-global/lib/node_modules}"

echo "building student worksheet…"
node render.js student-worksheet.md \
  --docx "$OUT/Arm Bolt Student Worksheet.docx"

echo "building teacher's guide…"
node render.js teachers-guide.md \
  --docx "$OUT/Arm Bolt Teachers Guide.docx" \
  --html "$OUT/Arm Bolt Teachers Guide.html" \
  --css artifact.css

echo
echo "done. generated:"
echo "  $OUT/Arm Bolt Student Worksheet.docx"
echo "  $OUT/Arm Bolt Teachers Guide.docx"
echo "  $OUT/Arm Bolt Teachers Guide.html   (publish this as the artifact)"
