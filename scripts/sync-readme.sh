#!/bin/bash

set -e

cp packages/server/data/daily_haiku_card.jpg ./assets/img/daily_haiku_card.jpg
cp packages/server/data/description.txt ./assets/description.txt
cp packages/server/data/social-preview-description.txt ./assets/social-preview-description.txt

# Update image cache buster (using extended regex)
sed -i -E "s/t=[0-9]+/t=$(date +%s)/" README.md

# Update description using awk (handles internal quotes)
description=$(cat assets/description.txt)
awk -v desc="$description" '
  /^> _".*"_$/ { print "> _\"" desc "\"_"; next }
  { print }
' README.md > README.md.tmp && mv README.md.tmp README.md

# Update date (using extended regex)
current_date=$(date +'%b %d, %Y')
sed -i -E "s/📅 _[^_]*_/📅 _${current_date}_/" README.md

# Commit and push if there are changes
if ! git diff --quiet assets README.md; then
    echo '\033[1;32mChanges detected, committing...\033[0m'
    git add assets README.md
    git commit -m "docs(readme): updated daily haiku card"
    git push https://$TOKEN@github.com/heristop/gutenku.git
else
    echo '\033[1;33mNo changes to commit\033[0m'
fi
