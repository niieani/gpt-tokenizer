#!/usr/bin/env bash
# Run from any directory. Use a new prefix to preserve every prior raw result.
set -euo pipefail
BENCH_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
REPO_ROOT=$(cd "$BENCH_ROOT/.." && pwd)
RUN_PREFIX=${1:?Usage: reproduce.sh NEW_PREFIX}
if [[ ! "$RUN_PREFIX" =~ ^[a-zA-Z0-9_-]+$ ]]; then
  echo 'Prefix must contain only letters, numbers, underscores and hyphens.' >&2
  exit 1
fi
if compgen -G "$BENCH_ROOT/results/$RUN_PREFIX-*.json" > /dev/null; then
  echo 'Prefix already has raw results; choose a new prefix.' >&2
  exit 1
fi
BUN_BIN=${GPT_BENCH_BUN:-$(command -v bun)}
QUEUE="$BENCH_ROOT/queue.py"
node26=(vp env exec --node 26.12.0 node)
queued() {
  local label=$1
  shift
  (cd "$BENCH_ROOT" && python3 "$QUEUE" --label "$RUN_PREFIX-$label" -- "$@")
}
# A measured source commit must already exist. Build outputs are independently
# hashed by both runners; memory refuses any later production/build change.
if [[ -n $(git -C "$REPO_ROOT" status --porcelain -- src) ]]; then
  echo 'Commit production source before measuring.' >&2
  exit 1
fi
queued validation bash -c 'cd "$1" && vp env exec --node 26.12.0 vp run build && vp env exec --node 26.12.0 vp run test && cd benchmark && vp env exec --node 26.12.0 yarn tsc' benchmark-validation "$REPO_ROOT"
queued correctness-node bash -c 'set -C; vp env exec --node 26.12.0 node experiments/correctness.mjs "$1/esm/encoding" > "results/$2-correctness-node.json"' benchmark-correctness "$REPO_ROOT" "$RUN_PREFIX"
queued correctness-bun bash -c 'set -C; "$1" experiments/correctness.mjs "$2/esm/encoding" > "results/$3-correctness-bun.json"' benchmark-correctness "$BUN_BIN" "$REPO_ROOT" "$RUN_PREFIX"
queued legacy-node-o200k "${node26[@]}" dist/benchmarkRunner.js --encodings o200k_base --rounds 5 --min-ms 300 --warm-ms 100 --output "results/$RUN_PREFIX-node-o200k.json"
queued legacy-node-cl100k "${node26[@]}" dist/benchmarkRunner.js --encodings cl100k_base --only gpt-tokenizer:local,gpt-tokenizer:npm --rounds 5 --min-ms 300 --warm-ms 100 --output "results/$RUN_PREFIX-node-cl100k.json"
queued legacy-bun "$BUN_BIN" dist/benchmarkRunner.js --only gpt-tokenizer:local,gpt-tokenizer:npm --rounds 5 --min-ms 300 --warm-ms 100 --output "results/$RUN_PREFIX-bun.json"
queued memory-node-o200k "${node26[@]}" dist/memoryRunner.js --timing "results/$RUN_PREFIX-node-o200k.json" --output "results/$RUN_PREFIX-memory-node-o200k.json"
queued memory-node-cl100k "${node26[@]}" dist/memoryRunner.js --timing "results/$RUN_PREFIX-node-cl100k.json" --output "results/$RUN_PREFIX-memory-node-cl100k.json"
queued memory-bun "$BUN_BIN" dist/memoryRunner.js --timing "results/$RUN_PREFIX-bun.json" --output "results/$RUN_PREFIX-memory-bun.json"
queued real-node-o200k "${node26[@]}" experiments/run.mjs --candidate "$REPO_ROOT/esm/encoding/o200k_base.js" --output "results/$RUN_PREFIX-real-node-o200k.json" --warm-ms 100 --min-ms 300
queued real-node-cl100k "${node26[@]}" experiments/run.mjs --encoding cl100k_base --candidate "$REPO_ROOT/esm/encoding/cl100k_base.js" --entries baseline,candidate --output "results/$RUN_PREFIX-real-node-cl100k.json" --warm-ms 100 --min-ms 100
for encoding in o200k_base cl100k_base; do
  queued "real-bun-$encoding" "$BUN_BIN" experiments/run.mjs --encoding "$encoding" --candidate "$REPO_ROOT/esm/encoding/$encoding.js" --entries baseline,candidate --output "results/$RUN_PREFIX-real-bun-$encoding.json" --warm-ms 100 --min-ms 100
done
queued consumed-node-o200k "${node26[@]}" experiments/run.mjs --candidate "$REPO_ROOT/esm/encoding/o200k_base.js" --entries baseline,candidate,tiktoken,@goliapkg/tiktoken-wasm --operations decode --consume full --output "results/$RUN_PREFIX-consumed-node-o200k.json" --warm-ms 100 --min-ms 300

# Preserve the original observations; confirmations are separate fresh runs.
if [[ ${GPT_BENCH_CONFIRM:-0} == 1 ]]; then
  for encoding in o200k_base cl100k_base; do
    suffix=node-o200k
    [[ "$encoding" == cl100k_base ]] && suffix=node-cl100k
    queued "confirm-$suffix" "${node26[@]}" dist/benchmarkRunner.js --encodings "$encoding" --only gpt-tokenizer:local,gpt-tokenizer:npm --rounds 5 --warm-ms 500 --min-ms 500 --output "results/$RUN_PREFIX-confirm-$suffix.json"
  done
  queued confirm-real-decode-node-o200k "${node26[@]}" experiments/run.mjs --candidate "$REPO_ROOT/esm/encoding/o200k_base.js" --entries baseline,candidate,ai-tokenizer --operations decode --output "results/$RUN_PREFIX-confirm-real-decode-node-o200k.json" --warm-ms 500 --min-ms 500
  queued confirm-consumed-node-o200k "${node26[@]}" experiments/run.mjs --candidate "$REPO_ROOT/esm/encoding/o200k_base.js" --entries baseline,candidate,tiktoken,@goliapkg/tiktoken-wasm --operations decode --consume full --output "results/$RUN_PREFIX-confirm-consumed-node-o200k.json" --warm-ms 500 --min-ms 500
  for encoding in o200k_base cl100k_base; do
    queued "confirm-real-decode-bun-$encoding" "$BUN_BIN" experiments/run.mjs --encoding "$encoding" --candidate "$REPO_ROOT/esm/encoding/$encoding.js" --entries baseline,candidate --operations decode --output "results/$RUN_PREFIX-confirm-real-decode-bun-$encoding.json" --warm-ms 500 --min-ms 500
  done
fi

# Redact publication metadata only; retain measured input/build/harness hashes.
python3 "$BENCH_ROOT/anonymize.py" "$BENCH_ROOT/results/$RUN_PREFIX-"*.json
