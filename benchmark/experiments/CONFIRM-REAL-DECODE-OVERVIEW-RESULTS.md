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


## Node v26.12.0 / o200k_base / API return (length only)

Source: `optimized-canonical-confirm-real-decode-node-o200k.json`; SHA-256 `9e7428523f68560b8e8f3c69a3fc7e4a02f1c476a37a9d4a8073d3f1afa75b00`.

| Category | Mode | Encode | Decode | Count |
|---|---|---|---|---|
| prose | repeated | not run | #2/2; 0.81× npm; ai-tokenizer; 1.27× C/L | not run |
| prose | stream | not run | #2/2; 0.86× npm; ai-tokenizer; 1.19× C/L | not run |
| code | repeated | not run | #2/2; 0.81× npm; ai-tokenizer; 1.26× C/L | not run |
| code | stream | not run | #2/2; 0.85× npm; ai-tokenizer; 1.23× C/L | not run |
| structured | repeated | not run | #2/2; 0.83× npm; ai-tokenizer; 1.29× C/L | not run |
| structured | stream | not run | #2/2; 0.81× npm; ai-tokenizer; 1.33× C/L | not run |
| multilingual | repeated | not run | #1/2; 1.03× npm; candidate; 1.00× C/L | not run |
| multilingual | stream | not run | #1/2; 1.07× npm; candidate; 1.00× C/L | not run |
| long-prose | repeated | not run | #1/2; 1.11× npm; candidate; 1.00× C/L | not run |
| long-prose | stream | not run | #1/2; 1.09× npm; candidate; 1.00× C/L | not run |
| long-code | repeated | not run | #2/2; 1.04× npm; ai-tokenizer; 1.04× C/L | not run |
| long-code | stream | not run | #2/2; 1.05× npm; ai-tokenizer; 1.05× C/L | not run |
| long-structured | repeated | not run | #2/2; 1.07× npm; ai-tokenizer; 1.03× C/L | not run |
| long-structured | stream | not run | #2/2; 1.09× npm; ai-tokenizer; 1.01× C/L | not run |

### Loss ledger versus npm

Every per-document median regression is included, even when ranges overlap. These rows compare median absolute latencies, independently of the paired category scores above. Durations are µs: median [min,max] over fresh processes; Δ is candidate minus npm. Small differences are descriptive, not proof of a regression.

| Document | Mode | Operation | Candidate µs [range] | npm µs [range] | Δ µs | C/npm |
|---|---|---|---:|---:|---:|---:|
| european | repeated | decode | 0.787 [0.764, 0.829] | 0.606 [0.598, 0.651] | 0.181 | 1.298× |
| logs | stream | decode | 1.194 [1.140, 1.242] | 0.928 [0.920, 0.965] | 0.266 | 1.286× |
| release | repeated | decode | 0.660 [0.619, 0.669] | 0.513 [0.499, 0.523] | 0.147 | 1.286× |
| chat-json | repeated | decode | 0.734 [0.717, 0.739] | 0.573 [0.568, 0.672] | 0.161 | 1.282× |
| support | repeated | decode | 0.504 [0.474, 0.528] | 0.399 [0.387, 0.446] | 0.105 | 1.263× |
| release | stream | decode | 0.781 [0.744, 0.856] | 0.624 [0.606, 0.654] | 0.157 | 1.251× |
| design | repeated | decode | 0.547 [0.512, 0.550] | 0.442 [0.429, 0.525] | 0.105 | 1.238× |
| typescript | repeated | decode | 0.744 [0.683, 0.775] | 0.605 [0.587, 0.677] | 0.139 | 1.229× |
| chat-json | stream | decode | 0.879 [0.836, 0.944] | 0.720 [0.710, 0.750] | 0.160 | 1.222× |
| sql | stream | decode | 0.728 [0.690, 0.767] | 0.598 [0.574, 0.661] | 0.130 | 1.217× |
| api-json | repeated | decode | 0.658 [0.627, 0.681] | 0.541 [0.525, 0.585] | 0.117 | 1.217× |
| python | repeated | decode | 0.586 [0.577, 0.620] | 0.485 [0.471, 0.551] | 0.102 | 1.210× |
| cjk | stream | decode | 1.007 [0.983, 1.026] | 0.839 [0.809, 0.948] | 0.169 | 1.201× |
| support | stream | decode | 0.663 [0.623, 0.695] | 0.554 [0.541, 0.593] | 0.109 | 1.197× |
| api-json | stream | decode | 0.817 [0.754, 0.843] | 0.685 [0.655, 0.738] | 0.132 | 1.192× |
| sql | repeated | decode | 0.559 [0.547, 0.602] | 0.469 [0.454, 0.488] | 0.090 | 1.191× |
| cjk | repeated | decode | 0.853 [0.826, 0.881] | 0.718 [0.696, 0.756] | 0.136 | 1.189× |
| european | stream | decode | 0.931 [0.880, 0.946] | 0.787 [0.754, 0.813] | 0.145 | 1.184× |
| typescript | stream | decode | 0.878 [0.831, 0.962] | 0.750 [0.714, 0.807] | 0.128 | 1.171× |
| python | stream | decode | 0.752 [0.744, 0.783] | 0.644 [0.600, 0.664] | 0.108 | 1.167× |
| logs | repeated | decode | 0.943 [0.920, 0.953] | 0.811 [0.788, 0.853] | 0.132 | 1.162× |
| design | stream | decode | 0.675 [0.659, 0.729] | 0.589 [0.581, 0.651] | 0.086 | 1.146× |

### Correctness probes

Every timed document/variant passed exact IDs, count and round-trip checks in every process. Additional non-timed probe failures across **all rounds** follow; they do not silently disappear from the comparison.

- `baseline` rounds 1, 2, 3, 4, 5: `{"count": false, "ids": false, "roundTrip": true, "text": " I'\u017fa"}`
- `baseline` rounds 1, 2, 3, 4, 5: `{"count": false, "ids": false, "roundTrip": true, "text": "\ud88a\ude13?t"}`
- `ai-tokenizer` rounds 1, 2, 3, 4, 5: `{"count": false, "ids": false, "roundTrip": true, "text": " I'\u017fa"}`
- `ai-tokenizer` rounds 1, 2, 3, 4, 5: `{"count": false, "ids": false, "roundTrip": true, "text": "\ud88a\ude13?t"}`
- `ai-tokenizer` rounds 1, 2, 3, 4, 5: `{"count": false, "ids": false, "roundTrip": false, "text": "\ufeffhello"}`
- `ai-tokenizer` rounds 1, 2, 3, 4, 5: `{"count": false, "ids": false, "roundTrip": false, "text": "a\u0085b\ufeffc\u00a0d"}`

### Provenance and limits

- Source commit `c69fba65cac2a6ce8bcac3e2e88b204a1a51e054`; executed-build manifest SHA-256 `234366c4ce34cd74c1ea94d30a2147b029d47ff141437767c75da49f018fd9e1` (245 JavaScript files). Working-tree status: M AGENTS.md  M README.md  M benchmark/FINDINGS.md  M benchmark/OPTIMIZATIONS.md  M benchmark/README.md  M benchmark/experiments/charts.py  M benchmark/experiments/legacy-report.py  M benchmark/experiments/publish.py ?? benchmark/OPTIMIZED-FINDINGS.md ?? benchmark/experiments/profile-count.mjs.
- Harness manifest SHA-256 `a108a39bbed0edf8497446f4a535b9a763797542be56d286d79571fcfaa9ee37`; corpus v2 SHA-256 `2a3a4eb1b0b9fc382f0a616157cae01fb95a74cf727ba7427a8576141fcd0542`; document/variant manifest SHA-256 `fbbcafa939ab433c0424fd7c50ee88adfd9dba0846313a94a7cb0540b3e88089`.
- Reported hardware: 8 CPUs (13th Gen Intel(R) Core(TM) i7-1360P), 15.54 GiB; linux/x64; 7.0.0-34-generic.
- Runtime `/user/.vite-plus/js_runtime/node/26.12.0/bin/node`; Node compatibility version `v26.12.0`; Bun `none`. 5 processes/entry; warmup ≥500 ms/20 calls; measurement ≥500 ms/5 calls.
- Baseline gpt-tokenizer 4.0.3; competitors: {"ai-tokenizer": "1.0.7", "tiktoken": "1.0.22"}.
- Run 2026-10-15T05:53:08.065Z → 2026-10-15T06:00:54.222Z. Corpus: Hand-authored for this repository in October 2026; no third-party extracts. Small representative document shapes, not a claim to production traffic distribution.
- Length consumption measures API-return latency and may leave lazy output strings unflattened; full consumption includes reading the entire output. These metrics are not pooled. The 32-variant stream is bounded, warmed and repeatedly cycled; it is not an unlimited unique/cold workload. First-use and memory diagnostics remain in the raw/full report and are not ranked here. Five process ranges are descriptive, not statistical significance.


## Bun 1.4.3 / o200k_base / API return (length only)

Source: `optimized-canonical-confirm-real-decode-bun-o200k_base.json`; SHA-256 `eae3fed40da2881bcf904b99d8336718eff5757ba790a0aff32d70a90d299cae`.

| Category | Mode | Encode | Decode | Count |
|---|---|---|---|---|
| prose | repeated | not run | #1/1; 0.98× npm; candidate; 1.00× C/L | not run |
| prose | stream | not run | #1/1; 0.98× npm; candidate; 1.00× C/L | not run |
| code | repeated | not run | #1/1; 1.01× npm; candidate; 1.00× C/L | not run |
| code | stream | not run | #1/1; 0.96× npm; candidate; 1.00× C/L | not run |
| structured | repeated | not run | #1/1; 0.96× npm; candidate; 1.00× C/L | not run |
| structured | stream | not run | #1/1; 1.01× npm; candidate; 1.00× C/L | not run |
| multilingual | repeated | not run | #1/1; 0.96× npm; candidate; 1.00× C/L | not run |
| multilingual | stream | not run | #1/1; 0.98× npm; candidate; 1.00× C/L | not run |
| long-prose | repeated | not run | #1/1; 1.09× npm; candidate; 1.00× C/L | not run |
| long-prose | stream | not run | #1/1; 1.11× npm; candidate; 1.00× C/L | not run |
| long-code | repeated | not run | #1/1; 1.12× npm; candidate; 1.00× C/L | not run |
| long-code | stream | not run | #1/1; 1.06× npm; candidate; 1.00× C/L | not run |
| long-structured | repeated | not run | #1/1; 1.02× npm; candidate; 1.00× C/L | not run |
| long-structured | stream | not run | #1/1; 1.01× npm; candidate; 1.00× C/L | not run |

### Loss ledger versus npm

Every per-document median regression is included, even when ranges overlap. These rows compare median absolute latencies, independently of the paired category scores above. Durations are µs: median [min,max] over fresh processes; Δ is candidate minus npm. Small differences are descriptive, not proof of a regression.

| Document | Mode | Operation | Candidate µs [range] | npm µs [range] | Δ µs | C/npm |
|---|---|---|---:|---:|---:|---:|
| mixed | repeated | decode | 2.172 [2.050, 2.367] | 1.970 [1.938, 2.173] | 0.202 | 1.103× |
| chat-json | repeated | decode | 1.250 [1.141, 1.322] | 1.141 [1.081, 1.220] | 0.109 | 1.095× |
| typescript | stream | decode | 1.558 [1.451, 1.694] | 1.429 [1.329, 1.482] | 0.130 | 1.091× |
| cjk | repeated | decode | 1.300 [1.268, 1.343] | 1.197 [1.169, 1.297] | 0.104 | 1.087× |
| release | repeated | decode | 1.079 [1.037, 1.083] | 1.000 [0.968, 1.054] | 0.079 | 1.079× |
| european | stream | decode | 1.441 [1.389, 1.501] | 1.345 [1.338, 1.382] | 0.096 | 1.072× |
| design | repeated | decode | 0.928 [0.891, 0.983] | 0.874 [0.855, 0.932] | 0.054 | 1.061× |
| mixed | stream | decode | 2.453 [2.315, 2.554] | 2.344 [2.273, 2.832] | 0.109 | 1.046× |
| python | stream | decode | 1.263 [1.180, 1.315] | 1.212 [1.170, 1.281] | 0.051 | 1.042× |
| python | repeated | decode | 1.069 [0.987, 1.127] | 1.029 [0.940, 1.033] | 0.039 | 1.038× |
| logs | repeated | decode | 1.614 [1.561, 1.856] | 1.558 [1.511, 1.798] | 0.056 | 1.036× |
| sql | stream | decode | 1.209 [1.134, 1.275] | 1.178 [1.119, 1.284] | 0.030 | 1.026× |
| european | repeated | decode | 1.159 [1.112, 1.206] | 1.131 [1.093, 1.188] | 0.028 | 1.025× |
| api-json | repeated | decode | 1.163 [1.082, 1.291] | 1.147 [1.060, 1.208] | 0.016 | 1.014× |
| api-json | stream | decode | 1.377 [1.285, 1.586] | 1.361 [1.292, 1.523] | 0.016 | 1.012× |
| cjk | stream | decode | 1.538 [1.429, 1.696] | 1.528 [1.412, 1.540] | 0.010 | 1.007× |
| logs | stream | decode | 1.860 [1.815, 1.873] | 1.852 [1.769, 2.018] | 0.008 | 1.004× |

### Correctness probes

Every timed document/variant passed exact IDs, count and round-trip checks in every process. Additional non-timed probe failures across **all rounds** follow; they do not silently disappear from the comparison.

- `baseline` rounds 1, 2, 3, 4, 5: `{"count": false, "ids": false, "roundTrip": true, "text": " I'\u017fa"}`
- `baseline` rounds 1, 2, 3, 4, 5: `{"count": false, "ids": false, "roundTrip": true, "text": "\ud88a\ude13?t"}`

### Provenance and limits

- Source commit `c69fba65cac2a6ce8bcac3e2e88b204a1a51e054`; executed-build manifest SHA-256 `234366c4ce34cd74c1ea94d30a2147b029d47ff141437767c75da49f018fd9e1` (245 JavaScript files). Working-tree status: M AGENTS.md  M README.md  M benchmark/FINDINGS.md  M benchmark/OPTIMIZATIONS.md  M benchmark/README.md  M benchmark/experiments/README.md  M benchmark/experiments/charts.py  M benchmark/experiments/legacy-report.py  M benchmark/experiments/publish.py ?? benchmark/OPTIMIZED-FINDINGS.md ?? benchmark/experiments/profile-count.mjs.
- Harness manifest SHA-256 `a108a39bbed0edf8497446f4a535b9a763797542be56d286d79571fcfaa9ee37`; corpus v2 SHA-256 `2a3a4eb1b0b9fc382f0a616157cae01fb95a74cf727ba7427a8576141fcd0542`; document/variant manifest SHA-256 `fbbcafa939ab433c0424fd7c50ee88adfd9dba0846313a94a7cb0540b3e88089`.
- Reported hardware: 8 CPUs (13th Gen Intel(R) Core(TM) i7-1360P), 15.54 GiB; linux/x64; 7.0.0-34-generic.
- Runtime `/user/.bun/bin/bun`; Node compatibility version `v26.3.0`; Bun `1.4.3`. 5 processes/entry; warmup ≥500 ms/20 calls; measurement ≥500 ms/5 calls.
- Baseline gpt-tokenizer 4.0.3; competitors: {"tiktoken": "1.0.22"}.
- Run 2026-10-15T06:10:49.854Z → 2026-10-15T06:16:02.482Z. Corpus: Hand-authored for this repository in October 2026; no third-party extracts. Small representative document shapes, not a claim to production traffic distribution.
- Length consumption measures API-return latency and may leave lazy output strings unflattened; full consumption includes reading the entire output. These metrics are not pooled. The 32-variant stream is bounded, warmed and repeatedly cycled; it is not an unlimited unique/cold workload. First-use and memory diagnostics remain in the raw/full report and are not ranked here. Five process ranges are descriptive, not statistical significance.


## Bun 1.4.3 / cl100k_base / API return (length only)

Source: `optimized-canonical-confirm-real-decode-bun-cl100k_base.json`; SHA-256 `64c59d2fe6aafbbb4c16082536e24173498c6c61eb86c40a85b7cb0fa1636d97`.

| Category | Mode | Encode | Decode | Count |
|---|---|---|---|---|
| prose | repeated | not run | #1/1; 1.01× npm; candidate; 1.00× C/L | not run |
| prose | stream | not run | #1/1; 0.99× npm; candidate; 1.00× C/L | not run |
| code | repeated | not run | #1/1; 1.01× npm; candidate; 1.00× C/L | not run |
| code | stream | not run | #1/1; 1.01× npm; candidate; 1.00× C/L | not run |
| structured | repeated | not run | #1/1; 1.02× npm; candidate; 1.00× C/L | not run |
| structured | stream | not run | #1/1; 1.05× npm; candidate; 1.00× C/L | not run |
| multilingual | repeated | not run | #1/1; 1.83× npm; candidate; 1.00× C/L | not run |
| multilingual | stream | not run | #1/1; 2.04× npm; candidate; 1.00× C/L | not run |
| long-prose | repeated | not run | #1/1; 1.12× npm; candidate; 1.00× C/L | not run |
| long-prose | stream | not run | #1/1; 1.12× npm; candidate; 1.00× C/L | not run |
| long-code | repeated | not run | #1/1; 1.06× npm; candidate; 1.00× C/L | not run |
| long-code | stream | not run | #1/1; 1.09× npm; candidate; 1.00× C/L | not run |
| long-structured | repeated | not run | #1/1; 1.15× npm; candidate; 1.00× C/L | not run |
| long-structured | stream | not run | #1/1; 1.04× npm; candidate; 1.00× C/L | not run |

### Loss ledger versus npm

Every per-document median regression is included, even when ranges overlap. These rows compare median absolute latencies, independently of the paired category scores above. Durations are µs: median [min,max] over fresh processes; Δ is candidate minus npm. Small differences are descriptive, not proof of a regression.

| Document | Mode | Operation | Candidate µs [range] | npm µs [range] | Δ µs | C/npm |
|---|---|---|---:|---:|---:|---:|
| typescript | repeated | decode | 1.288 [1.242, 1.387] | 1.210 [1.185, 1.397] | 0.079 | 1.065× |
| python | repeated | decode | 1.055 [1.020, 1.077] | 1.003 [0.977, 1.300] | 0.052 | 1.052× |
| chat-json | repeated | decode | 1.214 [1.148, 1.247] | 1.161 [1.116, 1.736] | 0.053 | 1.046× |
| logs | repeated | decode | 1.656 [1.565, 1.768] | 1.595 [1.587, 1.692] | 0.061 | 1.038× |
| support | stream | decode | 1.101 [1.027, 1.245] | 1.068 [1.053, 1.295] | 0.033 | 1.031× |
| design | repeated | decode | 0.924 [0.863, 1.066] | 0.910 [0.893, 1.142] | 0.014 | 1.015× |
| support | repeated | decode | 0.860 [0.839, 0.892] | 0.859 [0.808, 1.175] | 0.001 | 1.001× |

### Correctness probes

Every timed document/variant passed exact IDs, count and round-trip checks in every process. Additional non-timed probe failures across **all rounds** follow; they do not silently disappear from the comparison.

- `baseline` rounds 1, 2, 3, 4, 5: `{"count": false, "ids": false, "roundTrip": true, "text": "\ud88a\ude13?t"}`

### Provenance and limits

- Source commit `c69fba65cac2a6ce8bcac3e2e88b204a1a51e054`; executed-build manifest SHA-256 `234366c4ce34cd74c1ea94d30a2147b029d47ff141437767c75da49f018fd9e1` (245 JavaScript files). Working-tree status: M AGENTS.md  M README.md  M benchmark/FINDINGS.md  M benchmark/OPTIMIZATIONS.md  M benchmark/README.md  M benchmark/experiments/README.md  M benchmark/experiments/charts.py  M benchmark/experiments/legacy-report.py  M benchmark/experiments/publish.py  M benchmark/experiments/reproduce.sh ?? benchmark/OPTIMIZED-FINDINGS.md ?? benchmark/experiments/profile-count.mjs.
- Harness manifest SHA-256 `a108a39bbed0edf8497446f4a535b9a763797542be56d286d79571fcfaa9ee37`; corpus v2 SHA-256 `2a3a4eb1b0b9fc382f0a616157cae01fb95a74cf727ba7427a8576141fcd0542`; document/variant manifest SHA-256 `fbbcafa939ab433c0424fd7c50ee88adfd9dba0846313a94a7cb0540b3e88089`.
- Reported hardware: 8 CPUs (13th Gen Intel(R) Core(TM) i7-1360P), 15.54 GiB; linux/x64; 7.0.0-34-generic.
- Runtime `/user/.bun/bin/bun`; Node compatibility version `v26.3.0`; Bun `1.4.3`. 5 processes/entry; warmup ≥500 ms/20 calls; measurement ≥500 ms/5 calls.
- Baseline gpt-tokenizer 4.0.3; competitors: {"tiktoken": "1.0.22"}.
- Run 2026-10-15T06:16:02.671Z → 2026-10-15T06:21:12.898Z. Corpus: Hand-authored for this repository in October 2026; no third-party extracts. Small representative document shapes, not a claim to production traffic distribution.
- Length consumption measures API-return latency and may leave lazy output strings unflattened; full consumption includes reading the entire output. These metrics are not pooled. The 32-variant stream is bounded, warmed and repeatedly cycled; it is not an unlimited unique/cold workload. First-use and memory diagnostics remain in the raw/full report and are not ranked here. Five process ranges are descriptive, not statistical significance.
