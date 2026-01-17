#!/bin/bash
# Batch collection script for ML training data
# Runs multiple GA extractions to accumulate elite haiku samples

set -e

RUNS=${1:-20}
ITERATIONS=${2:-10}
GENERATIONS=${3:-80}
POPULATION=${4:-120}

echo "🧠 ML Training Data Collection"
echo "=============================="
echo "Runs:        $RUNS"
echo "Iterations:  $ITERATIONS per run"
echo "Generations: $GENERATIONS"
echo "Population:  $POPULATION"
echo ""

# Get initial elite count
INITIAL_ELITES=$(cat data/evolution-samples.json 2>/dev/null | jq '[.samples[] | select(.wasElite == true)] | length' 2>/dev/null || echo "0")
echo "Initial elite samples: $INITIAL_ELITES"
echo ""

for run in $(seq 1 $RUNS); do
  echo "=== Run $run/$RUNS ==="

  pnpm extract -m ga -n "$ITERATIONS" --collect-training-data \
    --generations "$GENERATIONS" \
    --population "$POPULATION" \
    2>&1 | grep -E "(Generated|Training data|elite|Elite)" || true

  # Show progress
  CURRENT_ELITES=$(cat data/evolution-samples.json | jq '[.samples[] | select(.wasElite == true)] | length')
  TOTAL_SAMPLES=$(cat data/evolution-samples.json | jq '.samples | length')
  NEW_ELITES=$((CURRENT_ELITES - INITIAL_ELITES))

  echo "Progress: $CURRENT_ELITES elites (+$NEW_ELITES) / $TOTAL_SAMPLES total"
  echo ""

  sleep 1
done

echo "=============================="
echo "✅ Collection complete!"
echo ""

# Final stats
FINAL_ELITES=$(cat data/evolution-samples.json | jq '[.samples[] | select(.wasElite == true)] | length')
FINAL_TOTAL=$(cat data/evolution-samples.json | jq '.samples | length')
FINAL_NEGATIVES=$(cat data/evolution-samples.json | jq '[.samples[] | select(.generationDied != null and .generationDied <= 10)] | length')

echo "Final Statistics:"
echo "  Total samples:     $FINAL_TOTAL"
echo "  Elite (positive):  $FINAL_ELITES"
echo "  Early eliminated:  $FINAL_NEGATIVES"
echo "  New elites added:  $((FINAL_ELITES - INITIAL_ELITES))"
echo ""

if [ "$FINAL_ELITES" -ge 150 ]; then
  echo "🎉 Ready for training! Run:"
  echo "   pnpm ml:train -- -e 40 -t 8000"
elif [ "$FINAL_ELITES" -ge 100 ]; then
  echo "👍 Sufficient for basic training. Run:"
  echo "   pnpm ml:train -- -e 30 -t 5000"
else
  echo "⚠️  Need more elites. Run this script again or increase runs."
fi
