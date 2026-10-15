# Optimization experiment (publication budget)

Bun 1.4.3; o200k_base; 5 fresh processes per entry. Corpus 2a3a4eb1b0b9fc382f0a616157cae01fb95a74cf727ba7427a8576141fcd0542.

Output consumer: length; length consumes only output length, while full includes a complete output checksum. They are separate metrics.

Speedup is baseline npm latency / entry latency, geometric mean of equally weighted documents within each named category. Each process gives one category ratio; report its median [min, max]. Ranks are category/mode/operation specific; baseline npm is an unranked historical release reference. The 32-request stream is bounded and repeatedly cycled, so it measures changing requests with shared vocabulary, not unlimited unique text. No synthetic-dominated grand mean is used.

| Category | Mode | Operation | Entry | Rank | Speedup vs npm median [min,max] |
|---|---|---|---|---:|---:|
| prose | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| prose | repeated | decode | candidate | 1 | 0.976× [0.917, 1.034] |
| prose | stream | decode | baseline | — | 1.000× [1.000, 1.000] |
| prose | stream | decode | candidate | 1 | 0.985× [0.937, 1.052] |
| code | repeated | decode | candidate | 1 | 1.009× [0.896, 1.043] |
| code | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| code | stream | decode | baseline | — | 1.000× [1.000, 1.000] |
| code | stream | decode | candidate | 1 | 0.962× [0.898, 0.997] |
| structured | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| structured | repeated | decode | candidate | 1 | 0.961× [0.861, 1.024] |
| structured | stream | decode | candidate | 1 | 1.011× [0.976, 1.015] |
| structured | stream | decode | baseline | — | 1.000× [1.000, 1.000] |
| multilingual | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| multilingual | repeated | decode | candidate | 1 | 0.957× [0.896, 0.997] |
| multilingual | stream | decode | baseline | — | 1.000× [1.000, 1.000] |
| multilingual | stream | decode | candidate | 1 | 0.975× [0.905, 1.018] |
| long-prose | repeated | decode | candidate | 1 | 1.093× [0.983, 1.156] |
| long-prose | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| long-prose | stream | decode | candidate | 1 | 1.106× [1.037, 1.156] |
| long-prose | stream | decode | baseline | — | 1.000× [1.000, 1.000] |
| long-code | repeated | decode | candidate | 1 | 1.119× [0.998, 1.214] |
| long-code | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| long-code | stream | decode | candidate | 1 | 1.057× [0.891, 1.162] |
| long-code | stream | decode | baseline | — | 1.000× [1.000, 1.000] |
| long-structured | repeated | decode | candidate | 1 | 1.018× [0.991, 1.299] |
| long-structured | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| long-structured | stream | decode | candidate | 1 | 1.011× [0.902, 1.209] |
| long-structured | stream | decode | baseline | — | 1.000× [1.000, 1.000] |

## Per-document latency

Median [min,max] milliseconds across fresh processes. Use these rows to inspect whether a category gain hides a particular regression.

| Document | Mode | Operation | Entry | ms median [min,max] |
|---|---|---|---|---:|
| support | repeated | decode | baseline | 0.000853 [0.000788, 0.000924] |
| support | repeated | decode | candidate | 0.000828 [0.000775, 0.000940] |
| support | stream | decode | baseline | 0.001051 [0.001007, 0.001109] |
| support | stream | decode | candidate | 0.001018 [0.001006, 0.001313] |
| design | repeated | decode | baseline | 0.000874 [0.000855, 0.000932] |
| design | repeated | decode | candidate | 0.000928 [0.000891, 0.000983] |
| design | stream | decode | baseline | 0.001157 [0.001114, 0.001202] |
| design | stream | decode | candidate | 0.001148 [0.001127, 0.001314] |
| release | repeated | decode | baseline | 0.001000 [0.000968, 0.001054] |
| release | repeated | decode | candidate | 0.001079 [0.001037, 0.001083] |
| release | stream | decode | baseline | 0.001264 [0.001161, 0.001484] |
| release | stream | decode | candidate | 0.001247 [0.001235, 0.001261] |
| typescript | repeated | decode | baseline | 0.001276 [0.001150, 0.001397] |
| typescript | repeated | decode | candidate | 0.001249 [0.001177, 0.001345] |
| typescript | stream | decode | baseline | 0.001429 [0.001329, 0.001482] |
| typescript | stream | decode | candidate | 0.001558 [0.001451, 0.001694] |
| python | repeated | decode | baseline | 0.001029 [0.000940, 0.001033] |
| python | repeated | decode | candidate | 0.001069 [0.000987, 0.001127] |
| python | stream | decode | baseline | 0.001212 [0.001170, 0.001281] |
| python | stream | decode | candidate | 0.001263 [0.001180, 0.001315] |
| sql | repeated | decode | baseline | 0.000955 [0.000881, 0.001007] |
| sql | repeated | decode | candidate | 0.000953 [0.000925, 0.001009] |
| sql | stream | decode | baseline | 0.001178 [0.001119, 0.001284] |
| sql | stream | decode | candidate | 0.001209 [0.001134, 0.001275] |
| api-json | repeated | decode | baseline | 0.001147 [0.001060, 0.001208] |
| api-json | repeated | decode | candidate | 0.001163 [0.001082, 0.001291] |
| api-json | stream | decode | baseline | 0.001361 [0.001292, 0.001523] |
| api-json | stream | decode | candidate | 0.001377 [0.001285, 0.001586] |
| chat-json | repeated | decode | baseline | 0.001141 [0.001081, 0.001220] |
| chat-json | repeated | decode | candidate | 0.001250 [0.001141, 0.001322] |
| chat-json | stream | decode | baseline | 0.001424 [0.001354, 0.001481] |
| chat-json | stream | decode | candidate | 0.001381 [0.001376, 0.001523] |
| logs | repeated | decode | baseline | 0.001558 [0.001511, 0.001798] |
| logs | repeated | decode | candidate | 0.001614 [0.001561, 0.001856] |
| logs | stream | decode | baseline | 0.001852 [0.001769, 0.002018] |
| logs | stream | decode | candidate | 0.001860 [0.001815, 0.001873] |
| cjk | repeated | decode | baseline | 0.001197 [0.001169, 0.001297] |
| cjk | repeated | decode | candidate | 0.001300 [0.001268, 0.001343] |
| cjk | stream | decode | baseline | 0.001528 [0.001412, 0.001540] |
| cjk | stream | decode | candidate | 0.001538 [0.001429, 0.001696] |
| european | repeated | decode | baseline | 0.001131 [0.001093, 0.001188] |
| european | repeated | decode | candidate | 0.001159 [0.001112, 0.001206] |
| european | stream | decode | baseline | 0.001345 [0.001338, 0.001382] |
| european | stream | decode | candidate | 0.001441 [0.001389, 0.001501] |
| mixed | repeated | decode | baseline | 0.001970 [0.001938, 0.002173] |
| mixed | repeated | decode | candidate | 0.002172 [0.002050, 0.002367] |
| mixed | stream | decode | baseline | 0.002344 [0.002273, 0.002832] |
| mixed | stream | decode | candidate | 0.002453 [0.002315, 0.002554] |
| readme.md | repeated | decode | baseline | 0.068694 [0.065805, 0.073812] |
| readme.md | repeated | decode | candidate | 0.063860 [0.060195, 0.072884] |
| readme.md | stream | decode | baseline | 0.071328 [0.067819, 0.075114] |
| readme.md | stream | decode | candidate | 0.064262 [0.063559, 0.068781] |
| encoding.ts | repeated | decode | baseline | 0.069320 [0.067552, 0.075107] |
| encoding.ts | repeated | decode | candidate | 0.061864 [0.057920, 0.068157] |
| encoding.ts | stream | decode | baseline | 0.067527 [0.066075, 0.072759] |
| encoding.ts | stream | decode | candidate | 0.063906 [0.062634, 0.074298] |
| packages.json | repeated | decode | baseline | 0.024943 [0.023217, 0.026694] |
| packages.json | repeated | decode | candidate | 0.023447 [0.020545, 0.025104] |
| packages.json | stream | decode | baseline | 0.026640 [0.022749, 0.029077] |
| packages.json | stream | decode | candidate | 0.024046 [0.022431, 0.029521] |

## First-use and retained memory (unranked)

One complete document pass per fresh process before correctness/warmup. Document order is fixed, so individual first-use timings are order dependent. Initialization excludes engine startup and includes module import/factory. Heap/RSS deltas follow two event-loop turns and full GC. These are diagnostics; use the separate settled memory suite for publication.

| Entry | Initialization ms [min,max] | First-pass encode total ms [min,max] | Init heap delta MiB | First-pass heap delta MiB | First-pass RSS delta MiB |
|---|---:|---:|---:|---:|---:|
| baseline | 317.008 [259.696, 350.898] | 13.030 [11.842, 16.364] | 23.677 [23.676, 23.679] | 0.282 [0.271, 0.293] | 3.508 [2.160, 4.410] |
| candidate | 299.458 [262.310, 353.451] | 10.967 [10.043, 12.094] | 23.759 [23.744, 23.761] | 0.316 [0.314, 0.328] | 2.648 [1.363, 2.922] |

## Semantic probe mismatches

- baseline: {"text":" I'ſa","ids":false,"roundTrip":true,"count":false}
- baseline: {"text":"𲨓?t","ids":false,"roundTrip":true,"count":false}

All timed documents and all 32 variants passed exact token IDs, count, and round-trip gates against independent tiktoken in every worker. Semantic probes above are additional non-timed cases; their failures remain disclosed.
