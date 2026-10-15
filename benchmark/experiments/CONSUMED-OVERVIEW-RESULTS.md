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

Source: `optimized-canonical-consumed-node-o200k.json`; SHA-256 `2b262e7e47f07860065ac537a2ab0592e38fa8f664f8da86e6e91c9f7c5540da`.

| Category | Mode | Encode | Decode | Count |
|---|---|---|---|---|
| prose | repeated | not run | #1/3; 0.96× npm; candidate; 1.00× C/L | not run |
| prose | stream | not run | #1/3; 0.98× npm; candidate; 1.00× C/L | not run |
| code | repeated | not run | #2/3; 0.97× npm; @goliapkg/tiktoken-wasm; 1.01× C/L | not run |
| code | stream | not run | #2/3; 0.92× npm; @goliapkg/tiktoken-wasm; 1.10× C/L | not run |
| structured | repeated | not run | #2/3; 0.98× npm; @goliapkg/tiktoken-wasm; 1.03× C/L | not run |
| structured | stream | not run | #2/3; 0.97× npm; @goliapkg/tiktoken-wasm; 1.01× C/L | not run |
| multilingual | repeated | not run | #2/3; 1.06× npm; @goliapkg/tiktoken-wasm; 1.07× C/L | not run |
| multilingual | stream | not run | #2/3; 1.06× npm; @goliapkg/tiktoken-wasm; 1.03× C/L | not run |
| long-prose | repeated | not run | #3/3; 1.05× npm; @goliapkg/tiktoken-wasm; 1.44× C/L | not run |
| long-prose | stream | not run | #3/3; 1.08× npm; @goliapkg/tiktoken-wasm; 1.25× C/L | not run |
| long-code | repeated | not run | #3/3; 0.97× npm; @goliapkg/tiktoken-wasm; 1.34× C/L | not run |
| long-code | stream | not run | #3/3; 1.00× npm; @goliapkg/tiktoken-wasm; 1.20× C/L | not run |
| long-structured | repeated | not run | #3/3; 0.91× npm; tiktoken; 1.27× C/L | not run |
| long-structured | stream | not run | #2/3; 1.01× npm; @goliapkg/tiktoken-wasm; 1.14× C/L | not run |

### Loss ledger versus npm

Every per-document median regression is included, even when ranges overlap. These rows compare median absolute latencies, independently of the paired category scores above. Durations are µs: median [min,max] over fresh processes; Δ is candidate minus npm. Small differences are descriptive, not proof of a regression.

| Document | Mode | Operation | Candidate µs [range] | npm µs [range] | Δ µs | C/npm |
|---|---|---|---:|---:|---:|---:|
| python | stream | decode | 2.954 [2.848, 3.273] | 2.532 [2.451, 3.044] | 0.422 | 1.167× |
| cjk | repeated | decode | 1.939 [1.840, 2.285] | 1.707 [1.699, 2.032] | 0.232 | 1.136× |
| logs | stream | decode | 3.743 [3.178, 4.392] | 3.336 [2.994, 3.971] | 0.407 | 1.122× |
| european | stream | decode | 3.634 [3.492, 3.696] | 3.311 [3.120, 4.040] | 0.323 | 1.098× |
| cjk | stream | decode | 2.326 [2.240, 2.419] | 2.138 [2.121, 2.490] | 0.189 | 1.088× |
| european | repeated | decode | 3.014 [2.842, 3.288] | 2.793 [2.659, 3.566] | 0.221 | 1.079× |
| release | repeated | decode | 2.838 [2.810, 3.676] | 2.673 [2.588, 2.731] | 0.165 | 1.062× |
| chat-json | repeated | decode | 2.883 [2.794, 3.172] | 2.717 [2.572, 3.075] | 0.166 | 1.061× |
| design | stream | decode | 2.969 [2.896, 3.288] | 2.805 [2.778, 3.205] | 0.164 | 1.059× |
| support | stream | decode | 2.669 [2.557, 2.812] | 2.542 [2.431, 2.640] | 0.127 | 1.050× |
| typescript | stream | decode | 3.105 [2.976, 4.977] | 2.961 [2.856, 3.275] | 0.144 | 1.049× |
| python | repeated | decode | 2.393 [2.270, 2.960] | 2.293 [2.177, 2.481] | 0.100 | 1.044× |
| design | repeated | decode | 2.721 [2.533, 2.926] | 2.642 [2.436, 3.039] | 0.079 | 1.030× |
| sql | stream | decode | 2.533 [2.366, 2.697] | 2.471 [2.193, 2.484] | 0.062 | 1.025× |
| support | repeated | decode | 2.209 [2.100, 2.335] | 2.167 [2.135, 2.218] | 0.042 | 1.019× |
| sql | repeated | decode | 2.069 [1.989, 2.333] | 2.040 [1.838, 2.286] | 0.029 | 1.014× |
| typescript | repeated | decode | 2.702 [2.654, 3.787] | 2.668 [2.574, 3.024] | 0.034 | 1.013× |

### Correctness probes

Every timed document/variant passed exact IDs, count and round-trip checks in every process. Additional non-timed probe failures across **all rounds** follow; they do not silently disappear from the comparison.

- `baseline` rounds 1, 2, 3, 4, 5: `{"count": false, "ids": false, "roundTrip": true, "text": " I'\u017fa"}`
- `baseline` rounds 1, 2, 3, 4, 5: `{"count": false, "ids": false, "roundTrip": true, "text": "\ud88a\ude13?t"}`
- `@goliapkg/tiktoken-wasm` rounds 1, 2, 3, 4, 5: `{"count": false, "ids": false, "roundTrip": true, "text": " I'\u017fa"}`

### Provenance and limits

- Source commit `c69fba65cac2a6ce8bcac3e2e88b204a1a51e054`; executed-build manifest SHA-256 `234366c4ce34cd74c1ea94d30a2147b029d47ff141437767c75da49f018fd9e1` (245 JavaScript files). Working-tree status: clean.
- Harness manifest SHA-256 `a108a39bbed0edf8497446f4a535b9a763797542be56d286d79571fcfaa9ee37`; corpus v2 SHA-256 `2a3a4eb1b0b9fc382f0a616157cae01fb95a74cf727ba7427a8576141fcd0542`; document/variant manifest SHA-256 `fbbcafa939ab433c0424fd7c50ee88adfd9dba0846313a94a7cb0540b3e88089`.
- Reported hardware: 8 CPUs (13th Gen Intel(R) Core(TM) i7-1360P), 15.54 GiB; linux/x64; 7.0.0-34-generic.
- Runtime `/user/.vite-plus/js_runtime/node/26.12.0/bin/node`; Node compatibility version `v26.12.0`; Bun `none`. 5 processes/entry; warmup ≥100 ms/20 calls; measurement ≥300 ms/5 calls.
- Baseline gpt-tokenizer 4.0.3; competitors: {"@goliapkg/tiktoken-wasm": "4.1.2", "tiktoken": "1.0.22"}.
- Run 2026-10-15T05:06:34.572Z → 2026-10-15T05:10:55.208Z. Corpus: Hand-authored for this repository in October 2026; no third-party extracts. Small representative document shapes, not a claim to production traffic distribution.
- Length consumption measures API-return latency and may leave lazy output strings unflattened; full consumption includes reading the entire output. These metrics are not pooled. The 32-variant stream is bounded, warmed and repeatedly cycled; it is not an unlimited unique/cold workload. First-use and memory diagnostics remain in the raw/full report and are not ranked here. Five process ranges are descriptive, not statistical significance.
