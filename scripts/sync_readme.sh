#!/bin/bash

set -e

cp gutenku-api/.cache/daily_haiku_card.jpg ./assets/img/daily_haiku_card.jpg

if git status | grep -qF daily_haiku_card.jpg; then
    echo '\033[1;32mNew image found\033[0m'
    sed -i "s/t=[0-9]\+/t=$(date +%s)/" README.md
    sed -i "s/Last Snapshot:.*/Last Snapshot: \`$(date +'%a, %d %b %Y %H:%M:%S %z')\`/" README.md
    git add assets README.md
    git commit -m "[Readme] Updated Daily Haiku Card"
    git push https://$TOKEN@github.com/heristop/gutenku.git
fi
