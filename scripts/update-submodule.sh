#!/bin/bash
set -e

SUBMODULE_PATH="private/gutenguess"

echo "Checking gutenguess submodule..."

# Initialize submodule if not already done
git submodule update --init "$SUBMODULE_PATH"

# Get current commit
CURRENT=$(git -C "$SUBMODULE_PATH" rev-parse HEAD)

# Fetch latest from origin
git -C "$SUBMODULE_PATH" fetch origin --quiet

# Get remote commit
REMOTE=$(git -C "$SUBMODULE_PATH" rev-parse origin/main)

# Check if already up to date
if [ "$CURRENT" = "$REMOTE" ]; then
  echo "Submodule already up to date at $(echo $CURRENT | cut -c1-7)"
  exit 0
fi

# Update to latest
git -C "$SUBMODULE_PATH" checkout origin/main --quiet

# Stage the submodule update in parent repo
git add "$SUBMODULE_PATH"

echo "Submodule updated: $(echo $CURRENT | cut -c1-7) → $(echo $REMOTE | cut -c1-7)"
echo "Run 'git commit' to save the submodule update."
