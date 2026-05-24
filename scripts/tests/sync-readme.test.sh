#!/usr/bin/env bash
# Ad-hoc tests for scripts/sync-readme.sh
# Exercises the two awk programs (description formatter + README block
# replacer) against fixed inputs, with no git/network/file-copy side effects.
# Run from repo root: bash scripts/tests/sync-readme.test.sh

set -u
set -o pipefail

# ─────────────────────────────────────────────────────────────────────────────
# Awk programs — kept BYTE-IDENTICAL to scripts/sync-readme.sh so the tests
# fail as soon as the script and the tests drift.
# ─────────────────────────────────────────────────────────────────────────────

format_block_awk='BEGIN { RS="" } {
  gsub(/\r/, "")
  gsub(/\n/, " ")
  if (NR > 1) printf ">\n"
  printf "> _\"%s\"_\n", $0
}'

replace_block_awk='
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
'

# ─────────────────────────────────────────────────────────────────────────────
# Test harness
# ─────────────────────────────────────────────────────────────────────────────

PASS=0
FAIL=0
RED=$'\033[0;31m'
GREEN=$'\033[0;32m'
DIM=$'\033[0;90m'
NC=$'\033[0m'

assert_eq() {
  local name=$1 expected=$2 actual=$3
  if [[ "$expected" == "$actual" ]]; then
    PASS=$((PASS + 1))
    printf "  %s✓%s %s\n" "$GREEN" "$NC" "$name"
  else
    FAIL=$((FAIL + 1))
    printf "  %s✗%s %s\n" "$RED" "$NC" "$name"
    printf "    %sexpected:%s\n%s\n" "$DIM" "$NC" "$expected" | sed 's/^/      /'
    printf "    %sactual:%s\n%s\n" "$DIM" "$NC" "$actual" | sed 's/^/      /'
  fi
}

format_block() {
  awk "$format_block_awk"
}

replace_block() {
  local readme=$1 block=$2
  SYNC_README_BLOCK="$block" awk "$replace_block_awk" "$readme"
}

# ─────────────────────────────────────────────────────────────────────────────
# Tests — description block formatter
# ─────────────────────────────────────────────────────────────────────────────

echo "format_block:"

actual=$(printf 'A single paragraph description.' | format_block)
assert_eq "single paragraph → one blockquote-italic line" \
'> _"A single paragraph description."_' "$actual"

actual=$(printf 'Para one.\n\nPara two.' | format_block)
expected='> _"Para one."_
>
> _"Para two."_'
assert_eq "two paragraphs → separated by a bare-blockquote continuation line" "$expected" "$actual"

actual=$(printf 'A.\n\nB.\n\nC.' | format_block)
expected='> _"A."_
>
> _"B."_
>
> _"C."_'
assert_eq "three paragraphs → two continuation separators" "$expected" "$actual"

actual=$(printf 'First line of a paragraph\nwrapped onto two lines.' | format_block)
assert_eq "internal newlines collapse to a single line" \
'> _"First line of a paragraph wrapped onto two lines."_' "$actual"

actual=$(printf 'Hello\r\nworld.' | format_block)
assert_eq "CRLF input has \\r stripped" \
'> _"Hello world."_' "$actual"

actual=$(printf 'She said "yes" — that was it.' | format_block)
assert_eq "internal double-quotes are preserved verbatim" \
'> _"She said "yes" — that was it."_' "$actual"

actual=$(printf 'A.\n\n\n\nB.' | format_block)
expected='> _"A."_
>
> _"B."_'
assert_eq "multiple blank lines collapse to a single paragraph break" "$expected" "$actual"

# ─────────────────────────────────────────────────────────────────────────────
# Tests — README block replacement
# ─────────────────────────────────────────────────────────────────────────────

echo
echo "replace_block:"

readme_template=$(cat <<'EOF'
## Daily Haiku Card

<table>
<tr>
<td width="300" valign="top">
<img src="/assets/img/daily_haiku_card.jpg?t=0" width="280" alt="Daily Haiku Card">
</td>
<td valign="top">

> \_"old multi-line description that broke markdown italic across
paragraphs because emphasis cannot span blank lines.

The old script left raw underscores escaped here as well."\_

— **BotenKu** 📅 _May 24, 2026_

</td>
</tr>
</table>
EOF
)

block_single='> _"Fresh single-paragraph desc."_'

actual=$(printf '%s\n' "$readme_template" | replace_block /dev/stdin "$block_single")
expected=$(cat <<'EOF'
## Daily Haiku Card

<table>
<tr>
<td width="300" valign="top">
<img src="/assets/img/daily_haiku_card.jpg?t=0" width="280" alt="Daily Haiku Card">
</td>
<td valign="top">

> _"Fresh single-paragraph desc."_

— **BotenKu** 📅 _May 24, 2026_

</td>
</tr>
</table>
EOF
)
assert_eq "replaces old broken block with single-paragraph block" "$expected" "$actual"

block_multi='> _"Para one."_
>
> _"Para two."_'

actual=$(printf '%s\n' "$readme_template" | replace_block /dev/stdin "$block_multi")
expected=$(cat <<'EOF'
## Daily Haiku Card

<table>
<tr>
<td width="300" valign="top">
<img src="/assets/img/daily_haiku_card.jpg?t=0" width="280" alt="Daily Haiku Card">
</td>
<td valign="top">

> _"Para one."_
>
> _"Para two."_

— **BotenKu** 📅 _May 24, 2026_

</td>
</tr>
</table>
EOF
)
assert_eq "replaces old broken block with multi-paragraph block" "$expected" "$actual"

# Idempotency: running the replacement twice with the same block yields
# the same content as running it once.
once=$(printf '%s\n' "$readme_template" | replace_block /dev/stdin "$block_multi")
twice=$(printf '%s\n' "$once" | replace_block /dev/stdin "$block_multi")
assert_eq "replacement is idempotent on already-formatted README" "$once" "$twice"

# No `<td valign="top">` line → README must pass through unchanged.
no_td=$'## Header\n\nNo card here.\n'
actual=$(printf '%s' "$no_td" | replace_block /dev/stdin "$block_single")
assert_eq "README without the target block is passed through unchanged" \
"$no_td" "$actual"$'\n'

# Block content with embedded quotes survives the -v block= round-trip.
block_with_quotes='> _"She said "yes"."_'
actual=$(printf '%s\n' "$readme_template" | replace_block /dev/stdin "$block_with_quotes")
[[ "$actual" == *'> _"She said "yes"."_'* ]] && \
  assert_eq "block with internal quotes is inserted verbatim" "ok" "ok" || \
  assert_eq "block with internal quotes is inserted verbatim" "ok" "missing"

# ─────────────────────────────────────────────────────────────────────────────
# Tests — date sed (verifies the regex used in sync-readme.sh)
# ─────────────────────────────────────────────────────────────────────────────

echo
echo "date sed:"

actual=$(printf '— **BotenKu** 📅 _May 24, 2026_\n' | sed -E "s/📅 _[^_]*_/📅 _Jun 01, 2026_/")
assert_eq "date sed updates the byline date" \
'— **BotenKu** 📅 _Jun 01, 2026_' "$actual"

# ─────────────────────────────────────────────────────────────────────────────
# Summary
# ─────────────────────────────────────────────────────────────────────────────

echo
TOTAL=$((PASS + FAIL))
if (( FAIL == 0 )); then
  printf "%s%d passed%s (of %d)\n" "$GREEN" "$PASS" "$NC" "$TOTAL"
  exit 0
else
  printf "%s%d failed%s, %s%d passed%s (of %d)\n" \
    "$RED" "$FAIL" "$NC" "$GREEN" "$PASS" "$NC" "$TOTAL"
  exit 1
fi
