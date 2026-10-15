# Optimization experiments

This suite complements the immutable October baseline in `../RESULTS.md`. Its goal is to evaluate Node 26.12.0 / o200k changes on explicit workloads, while observing Bun 1.4.3 and cl100k. It does not redefine the original seven cases or claim one universal winner.

`corpus.json` contains twelve modest, hand-authored documents (three each: prose, code, structured requests/logs, multilingual). Provenance is embedded. Three additional real long documents are pinned to pre-optimization commit `323d09e`: the 20 KB README, 22 KB encoding source and 5.6 KB of actual package manifests. The distributed README is privacy-sanitized corpus v3; archived v2 measurements retain their original input hashes and cannot be reproduced byte-for-byte from this replacement. They have separate long-prose/code/structured categories, not extra weight in short-request categories. `snapshot.py` regenerates these fixtures from self-contained `snapshot-sources/` extracts without requiring local pre-publication Git objects; `snapshots/manifest.json` records sources and hashes. Every document has 32 deterministic request variants. Inputs, source hashes, candidate Git status/commit, relevant built modules, competitor versions, runtime, hardware, budget and process rounds are recorded. Changing the corpus requires a version bump.

All commands that build, test, or encode must use the global FIFO queue. Commands below assume the repo root and an already built candidate; the benchmark adapters require `yarn --cwd benchmark tsc` under the same lease. Install dependencies with the repository's frozen-lockfile flow, not in shared symlink directories.

```sh
QUEUE=/absolute/path/to/benchmark/queue.py
NODE=$(vp env exec --node 26.12.0 node -p process.execPath)
python3 "$QUEUE" --label experiment-correctness -- "$NODE" benchmark/experiments/correctness.mjs /absolute/candidate/esm/encoding
python3 "$QUEUE" --label experiment-node-o200k -- "$NODE" benchmark/experiments/run.mjs --candidate /absolute/candidate/esm/encoding/o200k_base.js --output /tmp/experiment-node-o200k.json
python3 "$QUEUE" --label experiment-report -- "$NODE" benchmark/experiments/report.mjs /tmp/experiment-node-o200k.json /tmp/experiment-node-o200k.md
```

Repeat with Bun's executable, and `--encoding cl100k_base --candidate .../cl100k_base.js`. The runner enforces the exact runtime versions. Default contenders are npm gpt-tokenizer 4.0.3 (baseline), candidate, ai-tokenizer, bpe-lite, Golia WASM, and tiktoken. `--entries baseline,candidate,bpe-lite` selects a subset. `--legacy` includes the original seven inputs as an explicitly separate category; the large Unicode case makes this substantially slower.

The twelve authored inputs are short request-shaped documents; the three repository snapshots extend coverage to 5–22 KB real documents, each explicitly labelled as a long category. These are reproducible examples rather than a sampled traffic distribution.

The default publication budget is five fresh processes per entry, at least 100 ms measured per document/mode/operation, preceded by at least 50 ms and 20 calls of warmup. Raw timings record the actual warmup duration/call count. `--exploratory --rounds 1 --min-ms 10 --warm-ms 5` produces clearly labelled smoke data. Never use it as ranking evidence. `--warm-ms 500 --min-ms 500` increases the time budget; `--warm-calls` can increase (but not reduce) the 20-call floor. `--operations encode,count --modes stream` selects a recorded subset for close-case follow-up; reports validate exact document/operation/mode coverage. Baseline and candidate remain adjacent with alternating order; contender positions rotate around the pair. The parent waits for child exit and stdout closure before starting the next worker, with a ten-minute kill/reap timeout. Existing output paths are rejected to preserve prior raw evidence.

Every worker first records initialization and an unprepared first document pass, before loading the reference or running correctness checks. This captures deferred work triggered by the base documents; stream variants can prepare additional entries or activate another path later during verification. Settled heap/RSS snapshots follow two event-loop turns and full GC. First-pass observations are order dependent and unranked, not reliable microsecond cold-start estimates. Original separate settled memory benchmarks remain necessary for publication and memory regression checks.

Before timing, every document and variant must match independent tiktoken's exact IDs, round-trip string and count. A mismatch aborts the run. Additional non-timed empty/BOM/whitespace/combining/long-piece probes remain disclosed; ai-tokenizer's known BOM mismatch does not silently disappear. The reference is freed before timing.

Two timing modes are separate: `repeated` uses one exact document; `stream` cycles 32 changing requests with shared vocabulary. Both are warmed, bounded workloads. Neither is an unbounded unique/cold-cache claim. No implementation-specific cache clearing is used. The shared caller dispatch/checksum overhead is included; absolute sub-microsecond differences need caution.

Reports normalize each document's latency against its paired npm process, then compute a geometric mean within each category. Categories, operations, and modes remain separate. Median [min,max] is over process-level category ratios; overlapping ranges do not prove rank order. Legacy synthetic cases are kept apart. An arbitrary arithmetic mean across input sizes is never the headline score.

`correctness.mjs` is an additional finite seeded differential gate: both encodings, all real variants, 250 Unicode strings, long pieces, combining text, lone surrogates, special token options, sync generators and async decoding of 350 arbitrary valid-vocabulary sequences (including 128–512-token and raw-byte-heavy paths), typed arrays, generic iterables, interleaved generators, and truncated prefixes. Cache-capacity transitions 0/1/64 are also checked. UTF-16 lone surrogates are compared to the reference's replacement behavior. Invalid numeric IDs are observed separately rather than treated as a standard portable API or sent to native code; public rejection/lossy behavior may differ. The seed and corpus hash are emitted for reproduction.

## Final comparison workflow

From a committed production source, run `bash benchmark/experiments/reproduce.sh NEW_PREFIX`. It builds/tests once, runs the expanded gate on both engines, compares every supported contender on Node/o200k, checks npm versus candidate on Node/cl100k and Bun/both encodings, measures matching settled memory, then runs the realistic categories. Every phase uses the global queue. Use a new prefix for each attempt; existing raw files are never overwritten. Primary realistic measurements use 100 ms warmup/300 ms measurement; informational comparisons use 100/100 ms, all with five fresh processes.

`legacy-report.py TIMING MEMORY OUTPUT` publishes scoped original-case results; use `-` for omitted memory without inferring footprint ranks. `report.mjs RAW OUTPUT` publishes full realistic tables. `overview.py RAW... --output OVERVIEW.md` publishes category ranks and every per-document median regression. npm is an unranked reference throughout. Informational runs with only npm/candidate establish release comparisons, not ranks against unmeasured competitors.

Any candidate-versus-leader result within 10%, overlapping process ranges, or a release regression above 5% warrants a focused 500/500 ms confirmation containing all relevant entries. Preserve the complete first run and publish confirmation separately; do not replace selected rounds or pool different sources/corpora.

## Output consumption diagnostic

The standard API-return timings consume output length. Decode can therefore return a lazy string rope; they do not include reading every character or writing the result elsewhere. `--consume full` records a different metric: each returned string/code unit or token ID is included in a checksum. Keep this end-to-end consumption cost separate from API-return latency. The raw configuration records the policy, and summaries never pool policies. A focused Node/o200k decode comparison with this option checks whether lazy output representation changes the conclusion.

The reproduction script always includes the separate complete-output decode
diagnostic. Set `GPT_BENCH_CONFIRM=1` to include the preserved 500/500 ms
confirmations: original Node cases, realistic Node decode, complete-output Node
decode, and realistic Bun decode for both encodings. Keep those files separate
from the first comparisons.

## Unranked count profile

`profile-count.mjs OUTPUT.json` profiles the repeated pinned long README on Node
26.12.0 after a one-second warmup, sampling each implementation for five seconds.
Run it under the same machine queue. It checks the count, records executed build
and input hashes, and stores sampled leaf-frame proportions. This uses one
process with profiler overhead, not fresh-process throughput evidence;
do not rank its call counts or pool them with benchmark samples. Inlined/native
frames and anonymous WASM functions limit attribution. Regex source is hashed
rather than dumping the large Unicode compatibility patterns.
