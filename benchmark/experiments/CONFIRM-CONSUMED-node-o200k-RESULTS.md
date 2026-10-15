# Optimization experiment (publication budget)

Node v26.12.0; o200k_base; 5 fresh processes per entry. Corpus 2a3a4eb1b0b9fc382f0a616157cae01fb95a74cf727ba7427a8576141fcd0542.

Output consumer: full; length consumes only output length, while full includes a complete output checksum. They are separate metrics.

Speedup is baseline npm latency / entry latency, geometric mean of equally weighted documents within each named category. Each process gives one category ratio; report its median [min, max]. Ranks are category/mode/operation specific; baseline npm is an unranked historical release reference. The 32-request stream is bounded and repeatedly cycled, so it measures changing requests with shared vocabulary, not unlimited unique text. No synthetic-dominated grand mean is used.

| Category | Mode | Operation | Entry | Rank | Speedup vs npm median [min,max] |
|---|---|---|---|---:|---:|
| prose | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| prose | repeated | decode | candidate | 1 | 0.923× [0.879, 0.967] |
| prose | repeated | decode | @goliapkg/tiktoken-wasm | 2 | 0.917× [0.856, 0.937] |
| prose | repeated | decode | tiktoken | 3 | 0.733× [0.715, 0.743] |
| prose | stream | decode | baseline | — | 1.000× [1.000, 1.000] |
| prose | stream | decode | @goliapkg/tiktoken-wasm | 1 | 0.957× [0.837, 0.986] |
| prose | stream | decode | candidate | 2 | 0.907× [0.860, 0.924] |
| prose | stream | decode | tiktoken | 3 | 0.732× [0.594, 0.787] |
| code | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| code | repeated | decode | candidate | 1 | 0.940× [0.844, 1.026] |
| code | repeated | decode | @goliapkg/tiktoken-wasm | 2 | 0.885× [0.824, 1.024] |
| code | repeated | decode | tiktoken | 3 | 0.685× [0.679, 0.738] |
| code | stream | decode | baseline | — | 1.000× [1.000, 1.000] |
| code | stream | decode | @goliapkg/tiktoken-wasm | 1 | 0.883× [0.877, 0.975] |
| code | stream | decode | candidate | 2 | 0.874× [0.859, 0.962] |
| code | stream | decode | tiktoken | 3 | 0.735× [0.706, 0.793] |
| structured | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| structured | repeated | decode | @goliapkg/tiktoken-wasm | 1 | 0.900× [0.853, 0.986] |
| structured | repeated | decode | candidate | 2 | 0.874× [0.832, 0.962] |
| structured | repeated | decode | tiktoken | 3 | 0.710× [0.703, 0.847] |
| structured | stream | decode | baseline | — | 1.000× [1.000, 1.000] |
| structured | stream | decode | @goliapkg/tiktoken-wasm | 1 | 0.940× [0.832, 1.069] |
| structured | stream | decode | candidate | 2 | 0.912× [0.828, 1.003] |
| structured | stream | decode | tiktoken | 3 | 0.748× [0.707, 0.817] |
| multilingual | repeated | decode | @goliapkg/tiktoken-wasm | 1 | 1.123× [1.106, 1.276] |
| multilingual | repeated | decode | candidate | 2 | 1.105× [1.069, 1.301] |
| multilingual | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| multilingual | repeated | decode | tiktoken | 3 | 0.930× [0.910, 1.060] |
| multilingual | stream | decode | @goliapkg/tiktoken-wasm | 1 | 1.110× [1.080, 1.113] |
| multilingual | stream | decode | candidate | 2 | 1.045× [0.888, 1.063] |
| multilingual | stream | decode | baseline | — | 1.000× [1.000, 1.000] |
| multilingual | stream | decode | tiktoken | 3 | 0.907× [0.855, 0.935] |
| long-prose | repeated | decode | @goliapkg/tiktoken-wasm | 1 | 1.300× [1.199, 1.395] |
| long-prose | repeated | decode | candidate | 2 | 1.041× [0.956, 1.103] |
| long-prose | repeated | decode | tiktoken | 3 | 1.010× [0.944, 1.144] |
| long-prose | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| long-prose | stream | decode | @goliapkg/tiktoken-wasm | 1 | 1.170× [1.101, 1.338] |
| long-prose | stream | decode | baseline | — | 1.000× [1.000, 1.000] |
| long-prose | stream | decode | candidate | 2 | 0.984× [0.891, 1.075] |
| long-prose | stream | decode | tiktoken | 3 | 0.933× [0.864, 0.985] |
| long-code | repeated | decode | @goliapkg/tiktoken-wasm | 1 | 1.065× [1.054, 1.155] |
| long-code | repeated | decode | tiktoken | 2 | 1.002× [0.957, 1.049] |
| long-code | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| long-code | repeated | decode | candidate | 3 | 0.944× [0.880, 1.016] |
| long-code | stream | decode | @goliapkg/tiktoken-wasm | 1 | 1.167× [1.132, 1.359] |
| long-code | stream | decode | candidate | 2 | 1.060× [0.980, 1.075] |
| long-code | stream | decode | tiktoken | 3 | 1.009× [0.689, 1.082] |
| long-code | stream | decode | baseline | — | 1.000× [1.000, 1.000] |
| long-structured | repeated | decode | @goliapkg/tiktoken-wasm | 1 | 1.107× [1.075, 1.163] |
| long-structured | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| long-structured | repeated | decode | tiktoken | 2 | 0.997× [0.907, 1.026] |
| long-structured | repeated | decode | candidate | 3 | 0.959× [0.909, 0.992] |
| long-structured | stream | decode | @goliapkg/tiktoken-wasm | 1 | 1.155× [1.113, 1.210] |
| long-structured | stream | decode | baseline | — | 1.000× [1.000, 1.000] |
| long-structured | stream | decode | candidate | 2 | 0.975× [0.935, 1.038] |
| long-structured | stream | decode | tiktoken | 3 | 0.957× [0.932, 1.016] |

## Per-document latency

Median [min,max] milliseconds across fresh processes. Use these rows to inspect whether a category gain hides a particular regression.

| Document | Mode | Operation | Entry | ms median [min,max] |
|---|---|---|---|---:|
| support | repeated | decode | baseline | 0.002050 [0.002032, 0.002092] |
| support | repeated | decode | candidate | 0.002082 [0.002073, 0.002210] |
| support | repeated | decode | tiktoken | 0.003149 [0.003070, 0.003289] |
| support | repeated | decode | @goliapkg/tiktoken-wasm | 0.002240 [0.002211, 0.002434] |
| support | stream | decode | baseline | 0.002430 [0.002385, 0.003014] |
| support | stream | decode | candidate | 0.002832 [0.002792, 0.003140] |
| support | stream | decode | tiktoken | 0.003551 [0.003445, 0.003893] |
| support | stream | decode | @goliapkg/tiktoken-wasm | 0.002650 [0.002538, 0.002684] |
| design | repeated | decode | baseline | 0.002386 [0.002334, 0.002822] |
| design | repeated | decode | candidate | 0.002926 [0.002659, 0.002995] |
| design | repeated | decode | tiktoken | 0.003300 [0.003157, 0.003436] |
| design | repeated | decode | @goliapkg/tiktoken-wasm | 0.002695 [0.002467, 0.002936] |
| design | stream | decode | baseline | 0.002843 [0.002742, 0.003170] |
| design | stream | decode | candidate | 0.003288 [0.003264, 0.003451] |
| design | stream | decode | tiktoken | 0.003974 [0.003819, 0.007270] |
| design | stream | decode | @goliapkg/tiktoken-wasm | 0.003102 [0.002789, 0.004165] |
| release | repeated | decode | baseline | 0.002765 [0.002670, 0.003049] |
| release | repeated | decode | candidate | 0.003041 [0.002907, 0.003159] |
| release | repeated | decode | tiktoken | 0.003550 [0.003333, 0.003669] |
| release | repeated | decode | @goliapkg/tiktoken-wasm | 0.002976 [0.002825, 0.003650] |
| release | stream | decode | baseline | 0.003308 [0.002852, 0.003445] |
| release | stream | decode | candidate | 0.003275 [0.003150, 0.003777] |
| release | stream | decode | tiktoken | 0.004019 [0.003941, 0.004154] |
| release | stream | decode | @goliapkg/tiktoken-wasm | 0.003445 [0.003132, 0.003652] |
| typescript | repeated | decode | baseline | 0.002865 [0.002471, 0.002978] |
| typescript | repeated | decode | candidate | 0.002708 [0.002539, 0.003005] |
| typescript | repeated | decode | tiktoken | 0.003571 [0.003544, 0.004129] |
| typescript | repeated | decode | @goliapkg/tiktoken-wasm | 0.003070 [0.002532, 0.003139] |
| typescript | stream | decode | baseline | 0.003225 [0.002979, 0.003284] |
| typescript | stream | decode | candidate | 0.003444 [0.003211, 0.003586] |
| typescript | stream | decode | tiktoken | 0.004115 [0.003953, 0.004144] |
| typescript | stream | decode | @goliapkg/tiktoken-wasm | 0.003331 [0.003076, 0.003480] |
| python | repeated | decode | baseline | 0.002344 [0.002057, 0.002566] |
| python | repeated | decode | candidate | 0.002603 [0.002256, 0.002763] |
| python | repeated | decode | tiktoken | 0.003264 [0.003190, 0.003447] |
| python | repeated | decode | @goliapkg/tiktoken-wasm | 0.002671 [0.002369, 0.002847] |
| python | stream | decode | baseline | 0.002552 [0.002348, 0.002926] |
| python | stream | decode | candidate | 0.003046 [0.002850, 0.003114] |
| python | stream | decode | tiktoken | 0.003600 [0.003573, 0.003684] |
| python | stream | decode | @goliapkg/tiktoken-wasm | 0.003079 [0.002612, 0.003823] |
| sql | repeated | decode | baseline | 0.002056 [0.001850, 0.002081] |
| sql | repeated | decode | candidate | 0.002171 [0.002120, 0.002311] |
| sql | repeated | decode | tiktoken | 0.003073 [0.002964, 0.003247] |
| sql | repeated | decode | @goliapkg/tiktoken-wasm | 0.002313 [0.002203, 0.002567] |
| sql | stream | decode | baseline | 0.002515 [0.002080, 0.002747] |
| sql | stream | decode | candidate | 0.002722 [0.002633, 0.002847] |
| sql | stream | decode | tiktoken | 0.003424 [0.003295, 0.003478] |
| sql | stream | decode | @goliapkg/tiktoken-wasm | 0.002608 [0.002443, 0.002733] |
| api-json | repeated | decode | baseline | 0.002068 [0.001773, 0.002719] |
| api-json | repeated | decode | candidate | 0.002142 [0.002030, 0.002222] |
| api-json | repeated | decode | tiktoken | 0.002836 [0.002757, 0.002978] |
| api-json | repeated | decode | @goliapkg/tiktoken-wasm | 0.002208 [0.001996, 0.002822] |
| api-json | stream | decode | baseline | 0.002324 [0.002258, 0.002465] |
| api-json | stream | decode | candidate | 0.002553 [0.002490, 0.003303] |
| api-json | stream | decode | tiktoken | 0.003375 [0.003174, 0.003437] |
| api-json | stream | decode | @goliapkg/tiktoken-wasm | 0.002603 [0.002554, 0.003891] |
| chat-json | repeated | decode | baseline | 0.002601 [0.002434, 0.002895] |
| chat-json | repeated | decode | candidate | 0.003272 [0.002653, 0.003820] |
| chat-json | repeated | decode | tiktoken | 0.003797 [0.003694, 0.003866] |
| chat-json | repeated | decode | @goliapkg/tiktoken-wasm | 0.003169 [0.002596, 0.003383] |
| chat-json | stream | decode | baseline | 0.003195 [0.003020, 0.003263] |
| chat-json | stream | decode | candidate | 0.003648 [0.003474, 0.004677] |
| chat-json | stream | decode | tiktoken | 0.004088 [0.003936, 0.004296] |
| chat-json | stream | decode | @goliapkg/tiktoken-wasm | 0.003269 [0.002930, 0.003619] |
| logs | repeated | decode | baseline | 0.002878 [0.002732, 0.003112] |
| logs | repeated | decode | candidate | 0.003195 [0.003183, 0.003512] |
| logs | repeated | decode | tiktoken | 0.003662 [0.003567, 0.003793] |
| logs | repeated | decode | @goliapkg/tiktoken-wasm | 0.002994 [0.002798, 0.003198] |
| logs | stream | decode | baseline | 0.003307 [0.003118, 0.005526] |
| logs | stream | decode | candidate | 0.003571 [0.003547, 0.003590] |
| logs | stream | decode | tiktoken | 0.004653 [0.004146, 0.004991] |
| logs | stream | decode | @goliapkg/tiktoken-wasm | 0.003360 [0.003142, 0.003632] |
| cjk | repeated | decode | baseline | 0.001718 [0.001677, 0.001772] |
| cjk | repeated | decode | candidate | 0.001907 [0.001870, 0.001949] |
| cjk | repeated | decode | tiktoken | 0.002855 [0.002829, 0.003028] |
| cjk | repeated | decode | @goliapkg/tiktoken-wasm | 0.002237 [0.002190, 0.002271] |
| cjk | stream | decode | baseline | 0.002165 [0.002062, 0.002234] |
| cjk | stream | decode | candidate | 0.002469 [0.002323, 0.003832] |
| cjk | stream | decode | tiktoken | 0.003315 [0.003278, 0.003650] |
| cjk | stream | decode | @goliapkg/tiktoken-wasm | 0.002617 [0.002551, 0.002773] |
| european | repeated | decode | baseline | 0.002911 [0.002753, 0.004579] |
| european | repeated | decode | candidate | 0.003015 [0.002928, 0.003233] |
| european | repeated | decode | tiktoken | 0.004082 [0.003947, 0.004277] |
| european | repeated | decode | @goliapkg/tiktoken-wasm | 0.003543 [0.003442, 0.003938] |
| european | stream | decode | baseline | 0.003190 [0.003095, 0.003252] |
| european | stream | decode | candidate | 0.003474 [0.003389, 0.003800] |
| european | stream | decode | tiktoken | 0.004662 [0.004443, 0.004736] |
| european | stream | decode | @goliapkg/tiktoken-wasm | 0.003976 [0.003819, 0.003996] |
| mixed | repeated | decode | baseline | 0.006874 [0.006329, 0.007106] |
| mixed | repeated | decode | candidate | 0.004177 [0.004098, 0.004492] |
| mixed | repeated | decode | tiktoken | 0.003480 [0.003417, 0.003688] |
| mixed | repeated | decode | @goliapkg/tiktoken-wasm | 0.002893 [0.002865, 0.002995] |
| mixed | stream | decode | baseline | 0.006736 [0.006319, 0.007310] |
| mixed | stream | decode | candidate | 0.004695 [0.004575, 0.005227] |
| mixed | stream | decode | tiktoken | 0.004003 [0.003947, 0.004271] |
| mixed | stream | decode | @goliapkg/tiktoken-wasm | 0.003295 [0.003241, 0.003593] |
| readme.md | repeated | decode | baseline | 0.192772 [0.185920, 0.205591] |
| readme.md | repeated | decode | candidate | 0.186441 [0.180800, 0.194387] |
| readme.md | repeated | decode | tiktoken | 0.194147 [0.173432, 0.198230] |
| readme.md | repeated | decode | @goliapkg/tiktoken-wasm | 0.148167 [0.141817, 0.164263] |
| readme.md | stream | decode | baseline | 0.192928 [0.174408, 0.198231] |
| readme.md | stream | decode | candidate | 0.196166 [0.179490, 0.199173] |
| readme.md | stream | decode | tiktoken | 0.201217 [0.196721, 0.210190] |
| readme.md | stream | decode | @goliapkg/tiktoken-wasm | 0.149041 [0.146397, 0.168320] |
| encoding.ts | repeated | decode | baseline | 0.189973 [0.172245, 0.197267] |
| encoding.ts | repeated | decode | candidate | 0.195691 [0.186309, 0.201856] |
| encoding.ts | repeated | decode | tiktoken | 0.185002 [0.167675, 0.198378] |
| encoding.ts | repeated | decode | @goliapkg/tiktoken-wasm | 0.166717 [0.163473, 0.178319] |
| encoding.ts | stream | decode | baseline | 0.194119 [0.193291, 0.203705] |
| encoding.ts | stream | decode | candidate | 0.183338 [0.181664, 0.200901] |
| encoding.ts | stream | decode | tiktoken | 0.195107 [0.178589, 0.281239] |
| encoding.ts | stream | decode | @goliapkg/tiktoken-wasm | 0.166159 [0.149846, 0.170707] |
| packages.json | repeated | decode | baseline | 0.048583 [0.047566, 0.049093] |
| packages.json | repeated | decode | candidate | 0.050650 [0.047976, 0.054002] |
| packages.json | repeated | decode | tiktoken | 0.048503 [0.047861, 0.052442] |
| packages.json | repeated | decode | @goliapkg/tiktoken-wasm | 0.043877 [0.041815, 0.045544] |
| packages.json | stream | decode | baseline | 0.049355 [0.048221, 0.051387] |
| packages.json | stream | decode | candidate | 0.050344 [0.049528, 0.051574] |
| packages.json | stream | decode | tiktoken | 0.051470 [0.047469, 0.053538] |
| packages.json | stream | decode | @goliapkg/tiktoken-wasm | 0.043056 [0.041256, 0.043888] |

## First-use and retained memory (unranked)

One complete document pass per fresh process before correctness/warmup. Document order is fixed, so individual first-use timings are order dependent. Initialization excludes engine startup and includes module import/factory. Heap/RSS deltas follow two event-loop turns and full GC. These are diagnostics; use the separate settled memory suite for publication.

| Entry | Initialization ms [min,max] | First-pass encode total ms [min,max] | Init heap delta MiB | First-pass heap delta MiB | First-pass RSS delta MiB |
|---|---:|---:|---:|---:|---:|
| baseline | 110.365 [101.838, 116.744] | 23.830 [21.532, 25.114] | 15.955 [15.954, 15.955] | 0.525 [0.525, 0.525] | 6.875 [6.500, 8.355] |
| candidate | 109.234 [106.454, 117.244] | 19.142 [18.988, 21.283] | 16.068 [16.067, 16.074] | 0.474 [0.468, 0.475] | 2.250 [2.000, 3.125] |
| tiktoken | 130.443 [125.660, 159.215] | 20.641 [18.180, 22.980] | 0.218 [0.218, 0.219] | 0.064 [0.063, 0.064] | -2.395 [-22.242, 2.520] |
| @goliapkg/tiktoken-wasm | 124.525 [121.053, 132.911] | 23.759 [20.486, 36.676] | 2.391 [2.011, 2.394] | 0.059 [0.056, 0.059] | 7.875 [3.832, 10.875] |

## Semantic probe mismatches

- baseline: {"text":" I'ſa","ids":false,"roundTrip":true,"count":false}
- baseline: {"text":"𲨓?t","ids":false,"roundTrip":true,"count":false}
- @goliapkg/tiktoken-wasm: {"text":" I'ſa","ids":false,"roundTrip":true,"count":false}

All timed documents and all 32 variants passed exact token IDs, count, and round-trip gates against independent tiktoken in every worker. Semantic probes above are additional non-timed cases; their failures remain disclosed.
