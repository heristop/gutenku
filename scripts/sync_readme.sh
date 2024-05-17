#!/bin/bash

set -e

cp packages/server/data/daily_haiku_card.jpg ./assets/img/daily_haiku_card.jpg
cp packages/server/data/description.txt ./assets/description.txt

if git status | grep -qF daily_haiku_card.jpg; then
    echo '\033[1;32mNew image found\033[0m'
    sed -i "s/t=[0-9]\+/t=$(date +%s)/" README.md
    sed -i "s/Last Snapshot:.*/Last Snapshot: \`$(date +'%a, %d %b %Y %H:%M:%S %z')\`/" README.md

    description=$(cat assets/description.txt)
    sed -i "s/“[^”]*”/“$description”/" README.md

    git add assets README.md
    git commit -m "docs(readme): updated daily haiku card"
    git push https://$TOKEN@github.com/heristop/gutenku.git
fi
