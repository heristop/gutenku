#!/bin/bash

set -e

cp packages/server/data/daily_haiku_card.jpg ./assets/img/daily_haiku_card.jpg
cp packages/server/data/description.txt ./assets/description.txt

# Update image cache buster
sed -i "s/t=[0-9]\+/t=$(date +%s)/" README.md

# Update description
description=$(cat assets/description.txt)
escaped_desc=$(printf '%s\n' "$description" | sed 's/[&/\]/\\&/g')
sed -i "s/> _\".*\"_/> _\"$escaped_desc\"_/" README.md

# Update date
current_date=$(date +'%b %d, %Y')
sed -i "s/📅 _[^_]*_/📅 _${current_date}_/" README.md

# Commit and push if there are changes
if ! git diff --quiet assets README.md; then
    echo '\033[1;32mChanges detected, committing...\033[0m'
    git add assets README.md
    git commit -m "docs(readme): updated daily haiku card"
    git push https://$TOKEN@github.com/heristop/gutenku.git
else
    echo '\033[1;33mNo changes to commit\033[0m'
fi
