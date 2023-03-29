#!/bin/bash

set -e

cp gutenku-api/.cache/preview_haiku.jpg ./doc/img/daily_haiku_card.jpg

if git status | grep -qF daily_haiku_card.jpg; then
    echo '\033[1;32mNew image found\033[0m'
    sed -i "s/Last Run:.*/Last Run: \`$(date +'%a, %d %b %Y %H:%M:%S %z')\`/" README.md
    git add doc README.md
    git commit -m "[Readme] Updated Daily Haiku Card"
    git push https://$TOKEN@github.com/heristop/gutenku.git
fi
