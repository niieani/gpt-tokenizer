# Optimization overview

Each category and mode stands alone; there is no grand mean. Each operation cell
shows candidate rank among selected entries (excluding the historical npm baseline), median speedup
versus npm, leader name, and candidate/leader latency index (C/L; 1.00 is best).
A scoped rank of 1/1 is not a claim of market leadership.
Ranks use the median of process-level, equally weighted document geometric-mean
ratios (npm latency / entry latency), matching the full experiment report. C/L
is leader score / candidate score, a ratio of those category scores—not a median
absolute latency or a separate paired estimate. Close/overlapping process ranges
do not establish a statistically significant winner. Separate input files remain
separate comparisons; source/corpus differences are not silently pooled.


## Node v26.12.0 / o200k_base / API + complete output checksum

Source: `optimized-canonical-confirm-consumed-node-o200k.json`; SHA-256 `26ba301f7a9fd6c337ec5dc5129309c97c74794996ec61a56921e2e57da5b682`.

| Category | Mode | Encode | Decode | Count |
|---|---|---|---|---|
| prose | repeated | not run | #1/3; 0.92× npm; candidate; 1.00× C/L | not run |
| prose | stream | not run | #2/3; 0.91× npm; @goliapkg/tiktoken-wasm; 1.05× C/L | not run |
| code | repeated | not run | #1/3; 0.94× npm; candidate; 1.00× C/L | not run |
| code | stream | not run | #2/3; 0.87× npm; @goliapkg/tiktoken-wasm; 1.01× C/L | not run |
| structured | repeated | not run | #2/3; 0.87× npm; @goliapkg/tiktoken-wasm; 1.03× C/L | not run |
| structured | stream | not run | #2/3; 0.91× npm; @goliapkg/tiktoken-wasm; 1.03× C/L | not run |
| multilingual | repeated | not run | #2/3; 1.11× npm; @goliapkg/tiktoken-wasm; 1.02× C/L | not run |
| multilingual | stream | not run | #2/3; 1.05× npm; @goliapkg/tiktoken-wasm; 1.06× C/L | not run |
| long-prose | repeated | not run | #2/3; 1.04× npm; @goliapkg/tiktoken-wasm; 1.25× C/L | not run |
| long-prose | stream | not run | #2/3; 0.98× npm; @goliapkg/tiktoken-wasm; 1.19× C/L | not run |
| long-code | repeated | not run | #3/3; 0.94× npm; @goliapkg/tiktoken-wasm; 1.13× C/L | not run |
| long-code | stream | not run | #2/3; 1.06× npm; @goliapkg/tiktoken-wasm; 1.10× C/L | not run |
| long-structured | repeated | not run | #3/3; 0.96× npm; @goliapkg/tiktoken-wasm; 1.15× C/L | not run |
| long-structured | stream | not run | #2/3; 0.98× npm; @goliapkg/tiktoken-wasm; 1.18× C/L | not run |

### Loss ledger versus npm

Every per-document median regression is included, even when ranges overlap. These rows compare median absolute latencies, independently of the paired category scores above. Durations are µs: median [min,max] over fresh processes; Δ is candidate minus npm. Small differences are descriptive, not proof of a regression.

| Document | Mode | Operation | Candidate µs [range] | npm µs [range] | Δ µs | C/npm |
|---|---|---|---:|---:|---:|---:|
| chat-json | repeated | decode | 3.272 [2.653, 3.820] | 2.601 [2.434, 2.895] | 0.671 | 1.258× |
| design | repeated | decode | 2.926 [2.659, 2.995] | 2.386 [2.334, 2.822] | 0.540 | 1.227× |
| python | stream | decode | 3.046 [2.850, 3.114] | 2.552 [2.348, 2.926] | 0.494 | 1.193× |
| support | stream | decode | 2.832 [2.792, 3.140] | 2.430 [2.385, 3.014] | 0.402 | 1.165× |
| design | stream | decode | 3.288 [3.264, 3.451] | 2.843 [2.742, 3.170] | 0.445 | 1.157× |
| chat-json | stream | decode | 3.648 [3.474, 4.677] | 3.195 [3.020, 3.263] | 0.452 | 1.142× |
| cjk | stream | decode | 2.469 [2.323, 3.832] | 2.165 [2.062, 2.234] | 0.304 | 1.140× |
| python | repeated | decode | 2.603 [2.256, 2.763] | 2.344 [2.057, 2.566] | 0.259 | 1.111× |
| logs | repeated | decode | 3.195 [3.183, 3.512] | 2.878 [2.732, 3.112] | 0.317 | 1.110× |
| cjk | repeated | decode | 1.907 [1.870, 1.949] | 1.718 [1.677, 1.772] | 0.189 | 1.110× |
| release | repeated | decode | 3.041 [2.907, 3.159] | 2.765 [2.670, 3.049] | 0.276 | 1.100× |
| api-json | stream | decode | 2.553 [2.490, 3.303] | 2.324 [2.258, 2.465] | 0.229 | 1.099× |
| european | stream | decode | 3.474 [3.389, 3.800] | 3.190 [3.095, 3.252] | 0.284 | 1.089× |
| sql | stream | decode | 2.722 [2.633, 2.847] | 2.515 [2.080, 2.747] | 0.207 | 1.082× |
| logs | stream | decode | 3.571 [3.547, 3.590] | 3.307 [3.118, 5.526] | 0.264 | 1.080× |
| typescript | stream | decode | 3.444 [3.211, 3.586] | 3.225 [2.979, 3.284] | 0.219 | 1.068× |
| sql | repeated | decode | 2.171 [2.120, 2.311] | 2.056 [1.850, 2.081] | 0.115 | 1.056× |
| packages.json | repeated | decode | 50.650 [47.976, 54.002] | 48.583 [47.566, 49.093] | 2.067 | 1.043× |
| api-json | repeated | decode | 2.142 [2.030, 2.222] | 2.068 [1.773, 2.719] | 0.074 | 1.036× |
| european | repeated | decode | 3.015 [2.928, 3.233] | 2.911 [2.753, 4.579] | 0.104 | 1.036× |
| encoding.ts | repeated | decode | 195.691 [186.309, 201.856] | 189.973 [172.245, 197.267] | 5.718 | 1.030× |
| packages.json | stream | decode | 50.344 [49.528, 51.574] | 49.355 [48.221, 51.387] | 0.989 | 1.020× |
| readme.md | stream | decode | 196.166 [179.490, 199.173] | 192.928 [174.408, 198.231] | 3.238 | 1.017× |
| support | repeated | decode | 2.082 [2.073, 2.210] | 2.050 [2.032, 2.092] | 0.033 | 1.016× |

### Correctness probes

Every timed document/variant passed exact IDs, count and round-trip checks in every process. Additional non-timed probe failures across **all rounds** follow; they do not silently disappear from the comparison.

- `baseline` rounds 1, 2, 3, 4, 5: `{"count": false, "ids": false, "roundTrip": true, "text": " I'\u017fa"}`
- `baseline` rounds 1, 2, 3, 4, 5: `{"count": false, "ids": false, "roundTrip": true, "text": "\ud88a\ude13?t"}`
- `@goliapkg/tiktoken-wasm` rounds 1, 2, 3, 4, 5: `{"count": false, "ids": false, "roundTrip": true, "text": " I'\u017fa"}`

### Provenance and limits

- Source commit `c69fba65cac2a6ce8bcac3e2e88b204a1a51e054`; executed-build manifest SHA-256 `234366c4ce34cd74c1ea94d30a2147b029d47ff141437767c75da49f018fd9e1` (245 JavaScript files). Working-tree status: M README.md  M benchmark/FINDINGS.md  M benchmark/OPTIMIZATIONS.md  M benchmark/README.md  M benchmark/experiments/charts.py  M benchmark/experiments/legacy-report.py  M benchmark/experiments/publish.py.
- Harness manifest SHA-256 `a108a39bbed0edf8497446f4a535b9a763797542be56d286d79571fcfaa9ee37`; corpus v2 SHA-256 `2a3a4eb1b0b9fc382f0a616157cae01fb95a74cf727ba7427a8576141fcd0542`; document/variant manifest SHA-256 `fbbcafa939ab433c0424fd7c50ee88adfd9dba0846313a94a7cb0540b3e88089`.
- Reported hardware: 8 CPUs (13th Gen Intel(R) Core(TM) i7-1360P), 15.54 GiB; linux/x64; 7.0.0-34-generic.
- Runtime `/user/.vite-plus/js_runtime/node/26.12.0/bin/node`; Node compatibility version `v26.12.0`; Bun `none`. 5 processes/entry; warmup ≥500 ms/20 calls; measurement ≥500 ms/5 calls.
- Baseline gpt-tokenizer 4.0.3; competitors: {"@goliapkg/tiktoken-wasm": "4.1.2", "tiktoken": "1.0.22"}.
- Run 2026-10-15T05:14:26.667Z → 2026-10-15T05:24:47.358Z. Corpus: Hand-authored for this repository in October 2026; no third-party extracts. Small representative document shapes, not a claim to production traffic distribution.
- Length consumption measures API-return latency and may leave lazy output strings unflattened; full consumption includes reading the entire output. These metrics are not pooled. The 32-variant stream is bounded, warmed and repeatedly cycled; it is not an unlimited unique/cold workload. First-use and memory diagnostics remain in the raw/full report and are not ranked here. Five process ranges are descriptive, not statistical significance.
