#!/bin/bash
# Creates covers symlink if gutenguess submodule is initialized

GUTENGUESS_COVERS="private/gutenguess/packages/front/public/covers"
GUTENKU_COVERS="packages/front/public/covers"

if [ -d "$GUTENGUESS_COVERS" ]; then
  if [ ! -L "$GUTENKU_COVERS" ]; then
    ln -s "../../../$GUTENGUESS_COVERS" "$GUTENKU_COVERS"
    echo "✓ Created covers symlink"
  else
    echo "✓ Covers symlink already exists"
  fi
else
  echo "⚠ Gutenguess submodule not initialized - skipping covers symlink"
fi
