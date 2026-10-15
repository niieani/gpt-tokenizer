# Optimization experiment (publication budget)

Bun 1.4.3; cl100k_base; 5 fresh processes per entry. Corpus 2a3a4eb1b0b9fc382f0a616157cae01fb95a74cf727ba7427a8576141fcd0542.

Output consumer: length; length consumes only output length, while full includes a complete output checksum. They are separate metrics.

Speedup is baseline npm latency / entry latency, geometric mean of equally weighted documents within each named category. Each process gives one category ratio; report its median [min, max]. Ranks are category/mode/operation specific; baseline npm is an unranked historical release reference. The 32-request stream is bounded and repeatedly cycled, so it measures changing requests with shared vocabulary, not unlimited unique text. No synthetic-dominated grand mean is used.

| Category | Mode | Operation | Entry | Rank | Speedup vs npm median [min,max] |
|---|---|---|---|---:|---:|
| prose | repeated | decode | candidate | 1 | 1.013× [0.895, 1.197] |
| prose | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| prose | stream | decode | baseline | — | 1.000× [1.000, 1.000] |
| prose | stream | decode | candidate | 1 | 0.991× [0.933, 1.126] |
| code | repeated | decode | candidate | 1 | 1.008× [0.948, 1.093] |
| code | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| code | stream | decode | candidate | 1 | 1.013× [0.983, 1.117] |
| code | stream | decode | baseline | — | 1.000× [1.000, 1.000] |
| structured | repeated | decode | candidate | 1 | 1.024× [0.924, 1.117] |
| structured | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| structured | stream | decode | candidate | 1 | 1.053× [0.983, 1.084] |
| structured | stream | decode | baseline | — | 1.000× [1.000, 1.000] |
| multilingual | repeated | decode | candidate | 1 | 1.831× [1.686, 2.013] |
| multilingual | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| multilingual | stream | decode | candidate | 1 | 2.044× [1.809, 2.246] |
| multilingual | stream | decode | baseline | — | 1.000× [1.000, 1.000] |
| long-prose | repeated | decode | candidate | 1 | 1.117× [0.619, 1.135] |
| long-prose | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| long-prose | stream | decode | candidate | 1 | 1.122× [0.902, 1.236] |
| long-prose | stream | decode | baseline | — | 1.000× [1.000, 1.000] |
| long-code | repeated | decode | candidate | 1 | 1.063× [0.932, 1.387] |
| long-code | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| long-code | stream | decode | candidate | 1 | 1.094× [0.807, 1.183] |
| long-code | stream | decode | baseline | — | 1.000× [1.000, 1.000] |
| long-structured | repeated | decode | candidate | 1 | 1.148× [0.745, 1.332] |
| long-structured | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| long-structured | stream | decode | candidate | 1 | 1.039× [0.702, 1.229] |
| long-structured | stream | decode | baseline | — | 1.000× [1.000, 1.000] |

## Per-document latency

Median [min,max] milliseconds across fresh processes. Use these rows to inspect whether a category gain hides a particular regression.

| Document | Mode | Operation | Entry | ms median [min,max] |
|---|---|---|---|---:|
| support | repeated | decode | baseline | 0.000859 [0.000808, 0.001175] |
| support | repeated | decode | candidate | 0.000860 [0.000839, 0.000892] |
| support | stream | decode | baseline | 0.001068 [0.001053, 0.001295] |
| support | stream | decode | candidate | 0.001101 [0.001027, 0.001245] |
| design | repeated | decode | baseline | 0.000910 [0.000893, 0.001142] |
| design | repeated | decode | candidate | 0.000924 [0.000863, 0.001066] |
| design | stream | decode | baseline | 0.001191 [0.001128, 0.001310] |
| design | stream | decode | candidate | 0.001184 [0.001147, 0.001213] |
| release | repeated | decode | baseline | 0.001049 [0.001025, 0.001115] |
| release | repeated | decode | candidate | 0.001008 [0.000993, 0.001188] |
| release | stream | decode | baseline | 0.001348 [0.001233, 0.001404] |
| release | stream | decode | candidate | 0.001296 [0.001271, 0.001325] |
| typescript | repeated | decode | baseline | 0.001210 [0.001185, 0.001397] |
| typescript | repeated | decode | candidate | 0.001288 [0.001242, 0.001387] |
| typescript | stream | decode | baseline | 0.001572 [0.001432, 0.001614] |
| typescript | stream | decode | candidate | 0.001434 [0.001400, 0.001669] |
| python | repeated | decode | baseline | 0.001003 [0.000977, 0.001300] |
| python | repeated | decode | candidate | 0.001055 [0.001020, 0.001077] |
| python | stream | decode | baseline | 0.001295 [0.001257, 0.001565] |
| python | stream | decode | candidate | 0.001252 [0.001212, 0.001311] |
| sql | repeated | decode | baseline | 0.001023 [0.000914, 0.001038] |
| sql | repeated | decode | candidate | 0.000960 [0.000941, 0.000962] |
| sql | stream | decode | baseline | 0.001221 [0.001140, 0.001231] |
| sql | stream | decode | candidate | 0.001195 [0.001157, 0.001246] |
| api-json | repeated | decode | baseline | 0.001088 [0.001001, 0.001219] |
| api-json | repeated | decode | candidate | 0.001070 [0.001039, 0.001113] |
| api-json | stream | decode | baseline | 0.001345 [0.001254, 0.001380] |
| api-json | stream | decode | candidate | 0.001324 [0.001247, 0.001367] |
| chat-json | repeated | decode | baseline | 0.001161 [0.001116, 0.001736] |
| chat-json | repeated | decode | candidate | 0.001214 [0.001148, 0.001247] |
| chat-json | stream | decode | baseline | 0.001456 [0.001412, 0.001586] |
| chat-json | stream | decode | candidate | 0.001444 [0.001384, 0.001484] |
| logs | repeated | decode | baseline | 0.001595 [0.001587, 0.001692] |
| logs | repeated | decode | candidate | 0.001656 [0.001565, 0.001768] |
| logs | stream | decode | baseline | 0.002011 [0.001858, 0.002265] |
| logs | stream | decode | candidate | 0.001897 [0.001854, 0.001948] |
| cjk | repeated | decode | baseline | 0.004927 [0.004596, 0.005184] |
| cjk | repeated | decode | candidate | 0.003460 [0.003368, 0.004059] |
| cjk | stream | decode | baseline | 0.004995 [0.004841, 0.005240] |
| cjk | stream | decode | candidate | 0.002068 [0.001936, 0.002257] |
| european | repeated | decode | baseline | 0.002116 [0.001805, 0.003172] |
| european | repeated | decode | candidate | 0.001729 [0.001664, 0.001834] |
| european | stream | decode | baseline | 0.002231 [0.002155, 0.002337] |
| european | stream | decode | candidate | 0.002168 [0.002053, 0.002281] |
| mixed | repeated | decode | baseline | 0.007900 [0.007681, 0.008427] |
| mixed | repeated | decode | candidate | 0.002232 [0.002098, 0.002460] |
| mixed | stream | decode | baseline | 0.008983 [0.008275, 0.009283] |
| mixed | stream | decode | candidate | 0.002351 [0.002296, 0.003854] |
| readme.md | repeated | decode | baseline | 0.071554 [0.068504, 0.075850] |
| readme.md | repeated | decode | candidate | 0.066027 [0.062029, 0.115639] |
| readme.md | stream | decode | baseline | 0.074844 [0.070664, 0.079769] |
| readme.md | stream | decode | candidate | 0.069225 [0.064520, 0.081637] |
| encoding.ts | repeated | decode | baseline | 0.070400 [0.068234, 0.086907] |
| encoding.ts | repeated | decode | candidate | 0.064528 [0.061173, 0.093199] |
| encoding.ts | stream | decode | baseline | 0.076055 [0.071974, 0.079359] |
| encoding.ts | stream | decode | candidate | 0.067183 [0.065534, 0.090670] |
| packages.json | repeated | decode | baseline | 0.027176 [0.025282, 0.029808] |
| packages.json | repeated | decode | candidate | 0.024184 [0.022376, 0.034949] |
| packages.json | stream | decode | baseline | 0.025727 [0.025475, 0.027829] |
| packages.json | stream | decode | candidate | 0.024629 [0.022650, 0.037506] |

## First-use and retained memory (unranked)

One complete document pass per fresh process before correctness/warmup. Document order is fixed, so individual first-use timings are order dependent. Initialization excludes engine startup and includes module import/factory. Heap/RSS deltas follow two event-loop turns and full GC. These are diagnostics; use the separate settled memory suite for publication.

| Entry | Initialization ms [min,max] | First-pass encode total ms [min,max] | Init heap delta MiB | First-pass heap delta MiB | First-pass RSS delta MiB |
|---|---:|---:|---:|---:|---:|
| baseline | 134.905 [95.137, 168.540] | 18.846 [14.364, 29.411] | 11.673 [11.672, 11.675] | 0.377 [0.375, 0.379] | 7.016 [5.707, 8.090] |
| candidate | 148.721 [102.402, 180.864] | 12.100 [10.538, 17.185] | 11.756 [11.753, 11.758] | 1.553 [1.549, 1.558] | 4.559 [3.402, 5.500] |

## Semantic probe mismatches

- baseline: {"text":"𲨓?t","ids":false,"roundTrip":true,"count":false}

All timed documents and all 32 variants passed exact token IDs, count, and round-trip gates against independent tiktoken in every worker. Semantic probes above are additional non-timed cases; their failures remain disclosed.
