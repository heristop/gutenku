#!/bin/bash

set -e

cp packages/server/data/daily_haiku_card.jpg ./assets/img/daily_haiku_card.jpg
cp packages/server/data/preview_haiku.jpg ./assets/img/preview_haiku.jpg
cp packages/server/data/description.txt ./assets/description.txt
cp packages/server/data/social-preview-description.txt ./assets/social-preview-description.txt

# Update image cache buster (using extended regex)
sed -i -E "s/t=[0-9]+/t=$(date +%s)/" README.md

# Build the formatted description block from description.txt.
# - Splits on blank lines (paragraph mode, RS="").
# - Wraps each paragraph with markdown italic `_"..."_` inside a blockquote line.
# - Inserts a bare `>` between paragraphs so the blockquote stays continuous
#   while italic emphasis remains within each paragraph (markdown emphasis
#   cannot span paragraph breaks).
formatted_block=$(awk 'BEGIN { RS="" } {
  gsub(/\r/, "")
  gsub(/\n/, " ")
  if (NR > 1) printf ">\n"
  printf "> _\"%s\"_\n", $0
}' assets/description.txt)

# Replace the existing description block (lines between `<td valign="top">` and
# the `— **BotenKu** ... ` byline) with the freshly formatted block. The block
# is passed via ENVIRON (not awk -v) because BSD awk on macOS rejects newlines
# in -v assignments.
SYNC_README_BLOCK="$formatted_block" awk '
  BEGIN { block = ENVIRON["SYNC_README_BLOCK"] }
  /^<td valign="top">$/ {
    print
    print ""
    print block
    print ""
    in_desc = 1
    next
  }
  in_desc && /^— \*\*BotenKu\*\*/ {
    in_desc = 0
    print
    next
  }
  in_desc { next }
  { print }
' README.md > README.md.tmp && mv README.md.tmp README.md

# Update date (using extended regex)
current_date=$(date +'%b %d, %Y')
sed -i -E "s/📅 _[^_]*_/📅 _${current_date}_/" README.md

# Commit and push if there are changes
if ! git diff --quiet assets README.md; then
    echo -e '\033[1;32mChanges detected, committing...\033[0m'
    git add assets README.md
    git commit -m "docs(readme): updated daily haiku card"
    git push https://$TOKEN@github.com/heristop/gutenku.git
else
    echo -e '\033[1;33mNo changes to commit\033[0m'
fi
