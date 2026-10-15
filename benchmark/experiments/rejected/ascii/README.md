# Rejected ASCII o200k scanner experiment

Decision: reject the handwritten fused ASCII scanner. No scanner commit was made. Baseline was root bb5ec5a with an immutable compiled snapshot at /tmp/gpt-ascii-root-bb5ec5a-esm. Only the separate generator ownership fix was committed as 84e1cff (root cherry-pick 0224a28).

Node v26.12.0, two complete opposite-order pairs, fresh processes; each document/operation/mode received >=200 ms warmup and >=200 ms measurement. Queue ticket 84 was stopped and released after clear regression. Raw remains complete:false and is diagnostic, unranked evidence; Bun/cl100k timings were not run.

Geometric mean of per-document root/scanner latency ratios (higher is better; <1 means scanner loses):

| Category | Repeated encode round 0 | Round 1 |
| --- | ---: | ---: |
| prose | 0.424 | 0.413 |
| code | 0.398 | 0.367 |
| structured | 0.394 | 0.342 |
| multilingual | 0.963 | 1.000 |
| long-prose | 0.968 | 0.907 |
| long-code | 0.560 | 0.558 |
| long-structured | 0.489 | 0.467 |
| legacy | 0.498 | 0.472 |

The short ASCII prose/code/structured scanner was approximately 2.4–2.9x slower in both orders. Native global regex batching appears preferable here; scanner classification/branching and per-piece JS dispatch are hypotheses for the loss, not profiled attribution. Mixed-document/legacy npm cache history makes npm ratios unsuitable for headline claims.

Correctness: 3,422 project tests passed; full benchmark oracle gates passed on Node 26.12.0 and Bun 1.4.3, as did 1,504 additional seeded ASCII/mixed inputs at cache capacities 0/1/64/100000 against tiktoken 1.0.22. No mismatches observed.

Preserved artifacts: [partial raw data](results.json), [candidate source patch](candidate.patch), [paired probe](probe.mjs), and [additional oracle](oracle.mjs). Scripts retain the original absolute experiment paths and output paths; reconstruct the baseline at `bb5ec5a`, apply the candidate patch in a separate worktree, and adapt those paths for another machine. The raw file is deliberately incomplete and must never be fed into a publication ranking. The exact source/script hashes below describe the historical experiment, not a production candidate.

SHA-256:

- Frozen corpus JSON: `c1ffcce2675cd9253414684f31c61bf30350b1c392d809a632e47601166e8519`
- core: `12ca836676a4cb54011e657934426dc216b0ca7aff273988160a8fa795a84642`
- scanner: `69d42c0ea3a0cc8f1b13b74ae82c444890b58931ecffbf6bab5f6c9dae143270`
- compiledCore: `ced725ae9f4817db8e74f395a9671ddfda451435ebf948dafa271c0d1093ce09`
- compiledScanner: `a7312d2f112da9edfbe9d4c2132ae26e7eea3d018112354d72d208952b09ea34`
- rootCore: `a0816fdce1326c161e82a0085e0c0eec266f3995f4e08d3b80ff60c9c7a0c5ef`
- script: `93ce3353398f7186e3bde469384ba1f121a71c8080cf0326542bb4c4f3c5cb0d`

FIFO limitation carried forward: cache hits do not refresh FIFO order, so sustained unique misses can evict frequently used entries; the earlier unique-churn improvement is not a claim of universal real-traffic improvement.
