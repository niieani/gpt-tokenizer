# Optimization experiment (publication budget)

Node v26.12.0; o200k_base; 5 fresh processes per entry. Corpus 2a3a4eb1b0b9fc382f0a616157cae01fb95a74cf727ba7427a8576141fcd0542.

Output consumer: full; length consumes only output length, while full includes a complete output checksum. They are separate metrics.

Speedup is baseline npm latency / entry latency, geometric mean of equally weighted documents within each named category. Each process gives one category ratio; report its median [min, max]. Ranks are category/mode/operation specific; baseline npm is an unranked historical release reference. The 32-request stream is bounded and repeatedly cycled, so it measures changing requests with shared vocabulary, not unlimited unique text. No synthetic-dominated grand mean is used.

| Category | Mode | Operation | Entry | Rank | Speedup vs npm median [min,max] |
|---|---|---|---|---:|---:|
| prose | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| prose | repeated | decode | candidate | 1 | 0.956× [0.899, 0.986] |
| prose | repeated | decode | @goliapkg/tiktoken-wasm | 2 | 0.928× [0.807, 1.009] |
| prose | repeated | decode | tiktoken | 3 | 0.670× [0.646, 0.717] |
| prose | stream | decode | baseline | — | 1.000× [1.000, 1.000] |
| prose | stream | decode | candidate | 1 | 0.976× [0.906, 0.988] |
| prose | stream | decode | @goliapkg/tiktoken-wasm | 2 | 0.921× [0.906, 0.982] |
| prose | stream | decode | tiktoken | 3 | 0.719× [0.660, 0.732] |
| code | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| code | repeated | decode | @goliapkg/tiktoken-wasm | 1 | 0.979× [0.771, 1.040] |
| code | repeated | decode | candidate | 2 | 0.973× [0.812, 1.056] |
| code | repeated | decode | tiktoken | 3 | 0.748× [0.641, 0.752] |
| code | stream | decode | @goliapkg/tiktoken-wasm | 1 | 1.016× [0.754, 1.092] |
| code | stream | decode | baseline | — | 1.000× [1.000, 1.000] |
| code | stream | decode | candidate | 2 | 0.923× [0.800, 1.045] |
| code | stream | decode | tiktoken | 3 | 0.756× [0.710, 0.817] |
| structured | repeated | decode | @goliapkg/tiktoken-wasm | 1 | 1.002× [0.949, 1.066] |
| structured | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| structured | repeated | decode | candidate | 2 | 0.977× [0.876, 1.015] |
| structured | repeated | decode | tiktoken | 3 | 0.773× [0.660, 0.823] |
| structured | stream | decode | baseline | — | 1.000× [1.000, 1.000] |
| structured | stream | decode | @goliapkg/tiktoken-wasm | 1 | 0.982× [0.921, 1.096] |
| structured | stream | decode | candidate | 2 | 0.971× [0.920, 1.077] |
| structured | stream | decode | tiktoken | 3 | 0.759× [0.714, 0.817] |
| multilingual | repeated | decode | @goliapkg/tiktoken-wasm | 1 | 1.136× [1.072, 1.327] |
| multilingual | repeated | decode | candidate | 2 | 1.058× [1.016, 1.425] |
| multilingual | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| multilingual | repeated | decode | tiktoken | 3 | 0.940× [0.876, 1.135] |
| multilingual | stream | decode | @goliapkg/tiktoken-wasm | 1 | 1.100× [1.094, 1.499] |
| multilingual | stream | decode | candidate | 2 | 1.064× [1.037, 1.407] |
| multilingual | stream | decode | baseline | — | 1.000× [1.000, 1.000] |
| multilingual | stream | decode | tiktoken | 3 | 0.921× [0.897, 1.185] |
| long-prose | repeated | decode | @goliapkg/tiktoken-wasm | 1 | 1.510× [1.187, 1.641] |
| long-prose | repeated | decode | tiktoken | 2 | 1.222× [0.888, 1.258] |
| long-prose | repeated | decode | candidate | 3 | 1.052× [0.980, 1.325] |
| long-prose | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| long-prose | stream | decode | @goliapkg/tiktoken-wasm | 1 | 1.341× [1.032, 1.535] |
| long-prose | stream | decode | tiktoken | 2 | 1.269× [0.777, 1.372] |
| long-prose | stream | decode | candidate | 3 | 1.076× [0.985, 1.164] |
| long-prose | stream | decode | baseline | — | 1.000× [1.000, 1.000] |
| long-code | repeated | decode | @goliapkg/tiktoken-wasm | 1 | 1.298× [1.046, 1.362] |
| long-code | repeated | decode | tiktoken | 2 | 1.207× [0.706, 1.417] |
| long-code | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| long-code | repeated | decode | candidate | 3 | 0.966× [0.874, 1.171] |
| long-code | stream | decode | @goliapkg/tiktoken-wasm | 1 | 1.207× [1.102, 1.277] |
| long-code | stream | decode | tiktoken | 2 | 1.189× [0.976, 1.351] |
| long-code | stream | decode | candidate | 3 | 1.003× [0.917, 1.283] |
| long-code | stream | decode | baseline | — | 1.000× [1.000, 1.000] |
| long-structured | repeated | decode | tiktoken | 1 | 1.146× [1.023, 1.202] |
| long-structured | repeated | decode | @goliapkg/tiktoken-wasm | 2 | 1.035× [0.825, 1.312] |
| long-structured | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| long-structured | repeated | decode | candidate | 3 | 0.905× [0.740, 1.263] |
| long-structured | stream | decode | @goliapkg/tiktoken-wasm | 1 | 1.148× [0.827, 1.627] |
| long-structured | stream | decode | candidate | 2 | 1.008× [0.780, 1.277] |
| long-structured | stream | decode | baseline | — | 1.000× [1.000, 1.000] |
| long-structured | stream | decode | tiktoken | 3 | 0.886× [0.623, 1.416] |

## Per-document latency

Median [min,max] milliseconds across fresh processes. Use these rows to inspect whether a category gain hides a particular regression.

| Document | Mode | Operation | Entry | ms median [min,max] |
|---|---|---|---|---:|
| support | repeated | decode | baseline | 0.002167 [0.002135, 0.002218] |
| support | repeated | decode | candidate | 0.002209 [0.002100, 0.002335] |
| support | repeated | decode | tiktoken | 0.003293 [0.003263, 0.003420] |
| support | repeated | decode | @goliapkg/tiktoken-wasm | 0.002336 [0.002248, 0.002653] |
| support | stream | decode | baseline | 0.002542 [0.002431, 0.002640] |
| support | stream | decode | candidate | 0.002669 [0.002557, 0.002812] |
| support | stream | decode | tiktoken | 0.003712 [0.003591, 0.003845] |
| support | stream | decode | @goliapkg/tiktoken-wasm | 0.002718 [0.002633, 0.002783] |
| design | repeated | decode | baseline | 0.002642 [0.002436, 0.003039] |
| design | repeated | decode | candidate | 0.002721 [0.002533, 0.002926] |
| design | repeated | decode | tiktoken | 0.003877 [0.003816, 0.004165] |
| design | repeated | decode | @goliapkg/tiktoken-wasm | 0.002582 [0.002407, 0.002746] |
| design | stream | decode | baseline | 0.002805 [0.002778, 0.003205] |
| design | stream | decode | candidate | 0.002969 [0.002896, 0.003288] |
| design | stream | decode | tiktoken | 0.004430 [0.004080, 0.004508] |
| design | stream | decode | @goliapkg/tiktoken-wasm | 0.003309 [0.003243, 0.003342] |
| release | repeated | decode | baseline | 0.002673 [0.002588, 0.002731] |
| release | repeated | decode | candidate | 0.002838 [0.002810, 0.003676] |
| release | repeated | decode | tiktoken | 0.003792 [0.003495, 0.004019] |
| release | repeated | decode | @goliapkg/tiktoken-wasm | 0.003165 [0.002810, 0.004365] |
| release | stream | decode | baseline | 0.003192 [0.002985, 0.003696] |
| release | stream | decode | candidate | 0.003167 [0.003109, 0.004159] |
| release | stream | decode | tiktoken | 0.003898 [0.003822, 0.004431] |
| release | stream | decode | @goliapkg/tiktoken-wasm | 0.003165 [0.003123, 0.003437] |
| typescript | repeated | decode | baseline | 0.002668 [0.002574, 0.003024] |
| typescript | repeated | decode | candidate | 0.002702 [0.002654, 0.003787] |
| typescript | repeated | decode | tiktoken | 0.003266 [0.003192, 0.003802] |
| typescript | repeated | decode | @goliapkg/tiktoken-wasm | 0.002795 [0.002679, 0.003218] |
| typescript | stream | decode | baseline | 0.002961 [0.002856, 0.003275] |
| typescript | stream | decode | candidate | 0.003105 [0.002976, 0.004977] |
| typescript | stream | decode | tiktoken | 0.003576 [0.003465, 0.003643] |
| typescript | stream | decode | @goliapkg/tiktoken-wasm | 0.003029 [0.002971, 0.004013] |
| python | repeated | decode | baseline | 0.002293 [0.002177, 0.002481] |
| python | repeated | decode | candidate | 0.002393 [0.002270, 0.002960] |
| python | repeated | decode | tiktoken | 0.003222 [0.002905, 0.003712] |
| python | repeated | decode | @goliapkg/tiktoken-wasm | 0.002349 [0.002316, 0.003380] |
| python | stream | decode | baseline | 0.002532 [0.002451, 0.003044] |
| python | stream | decode | candidate | 0.002954 [0.002848, 0.003273] |
| python | stream | decode | tiktoken | 0.004466 [0.003829, 0.004797] |
| python | stream | decode | @goliapkg/tiktoken-wasm | 0.002650 [0.002603, 0.003860] |
| sql | repeated | decode | baseline | 0.002040 [0.001838, 0.002286] |
| sql | repeated | decode | candidate | 0.002069 [0.001989, 0.002333] |
| sql | repeated | decode | tiktoken | 0.003083 [0.002724, 0.003481] |
| sql | repeated | decode | @goliapkg/tiktoken-wasm | 0.002060 [0.002019, 0.002372] |
| sql | stream | decode | baseline | 0.002471 [0.002193, 0.002484] |
| sql | stream | decode | candidate | 0.002533 [0.002366, 0.002697] |
| sql | stream | decode | tiktoken | 0.002856 [0.002834, 0.003006] |
| sql | stream | decode | @goliapkg/tiktoken-wasm | 0.002370 [0.002319, 0.002528] |
| api-json | repeated | decode | baseline | 0.002049 [0.001793, 0.002256] |
| api-json | repeated | decode | candidate | 0.001986 [0.001909, 0.002460] |
| api-json | repeated | decode | tiktoken | 0.003057 [0.002683, 0.003829] |
| api-json | repeated | decode | @goliapkg/tiktoken-wasm | 0.002099 [0.001924, 0.002218] |
| api-json | stream | decode | baseline | 0.002525 [0.002177, 0.002890] |
| api-json | stream | decode | candidate | 0.002327 [0.002276, 0.003088] |
| api-json | stream | decode | tiktoken | 0.003687 [0.003269, 0.004103] |
| api-json | stream | decode | @goliapkg/tiktoken-wasm | 0.002624 [0.002264, 0.002702] |
| chat-json | repeated | decode | baseline | 0.002717 [0.002572, 0.003075] |
| chat-json | repeated | decode | candidate | 0.002883 [0.002794, 0.003172] |
| chat-json | repeated | decode | tiktoken | 0.003358 [0.003266, 0.003793] |
| chat-json | repeated | decode | @goliapkg/tiktoken-wasm | 0.002830 [0.002785, 0.003062] |
| chat-json | stream | decode | baseline | 0.003267 [0.002997, 0.004642] |
| chat-json | stream | decode | candidate | 0.003252 [0.003088, 0.003320] |
| chat-json | stream | decode | tiktoken | 0.003812 [0.003598, 0.004001] |
| chat-json | stream | decode | @goliapkg/tiktoken-wasm | 0.003195 [0.003115, 0.003869] |
| logs | repeated | decode | baseline | 0.002924 [0.002675, 0.003311] |
| logs | repeated | decode | candidate | 0.002844 [0.002683, 0.003837] |
| logs | repeated | decode | tiktoken | 0.003649 [0.003073, 0.004996] |
| logs | repeated | decode | @goliapkg/tiktoken-wasm | 0.002784 [0.002618, 0.003066] |
| logs | stream | decode | baseline | 0.003336 [0.002994, 0.003971] |
| logs | stream | decode | candidate | 0.003743 [0.003178, 0.004392] |
| logs | stream | decode | tiktoken | 0.004122 [0.003731, 0.005469] |
| logs | stream | decode | @goliapkg/tiktoken-wasm | 0.003514 [0.002975, 0.004293] |
| cjk | repeated | decode | baseline | 0.001707 [0.001699, 0.002032] |
| cjk | repeated | decode | candidate | 0.001939 [0.001840, 0.002285] |
| cjk | repeated | decode | tiktoken | 0.002889 [0.002753, 0.003009] |
| cjk | repeated | decode | @goliapkg/tiktoken-wasm | 0.002245 [0.002215, 0.002618] |
| cjk | stream | decode | baseline | 0.002138 [0.002121, 0.002490] |
| cjk | stream | decode | candidate | 0.002326 [0.002240, 0.002419] |
| cjk | stream | decode | tiktoken | 0.003292 [0.003255, 0.003563] |
| cjk | stream | decode | @goliapkg/tiktoken-wasm | 0.002608 [0.002534, 0.002638] |
| european | repeated | decode | baseline | 0.002793 [0.002659, 0.003566] |
| european | repeated | decode | candidate | 0.003014 [0.002842, 0.003288] |
| european | repeated | decode | tiktoken | 0.003967 [0.003896, 0.004255] |
| european | repeated | decode | @goliapkg/tiktoken-wasm | 0.003453 [0.003350, 0.003686] |
| european | stream | decode | baseline | 0.003311 [0.003120, 0.004040] |
| european | stream | decode | candidate | 0.003634 [0.003492, 0.003696] |
| european | stream | decode | tiktoken | 0.004433 [0.004277, 0.005098] |
| european | stream | decode | @goliapkg/tiktoken-wasm | 0.003839 [0.003781, 0.004299] |
| mixed | repeated | decode | baseline | 0.006885 [0.006432, 0.009160] |
| mixed | repeated | decode | candidate | 0.004318 [0.004235, 0.004597] |
| mixed | repeated | decode | tiktoken | 0.003558 [0.003432, 0.003715] |
| mixed | repeated | decode | @goliapkg/tiktoken-wasm | 0.002861 [0.002840, 0.003223] |
| mixed | stream | decode | baseline | 0.006645 [0.006546, 0.010988] |
| mixed | stream | decode | candidate | 0.004696 [0.004541, 0.004828] |
| mixed | stream | decode | tiktoken | 0.004023 [0.003903, 0.004143] |
| mixed | stream | decode | @goliapkg/tiktoken-wasm | 0.003319 [0.003211, 0.003421] |
| readme.md | repeated | decode | baseline | 0.223901 [0.174611, 0.239212] |
| readme.md | repeated | decode | candidate | 0.207644 [0.178128, 0.212928] |
| readme.md | repeated | decode | tiktoken | 0.189414 [0.171581, 0.220432] |
| readme.md | repeated | decode | @goliapkg/tiktoken-wasm | 0.147141 [0.145776, 0.148309] |
| readme.md | stream | decode | baseline | 0.220776 [0.171141, 0.237780] |
| readme.md | stream | decode | candidate | 0.189636 [0.173528, 0.225641] |
| readme.md | stream | decode | tiktoken | 0.175138 [0.171943, 0.253245] |
| readme.md | stream | decode | @goliapkg/tiktoken-wasm | 0.154903 [0.146810, 0.165874] |
| encoding.ts | repeated | decode | baseline | 0.201861 [0.170272, 0.234787] |
| encoding.ts | repeated | decode | candidate | 0.187433 [0.182559, 0.230992] |
| encoding.ts | repeated | decode | tiktoken | 0.167235 [0.165684, 0.241135] |
| encoding.ts | repeated | decode | @goliapkg/tiktoken-wasm | 0.164900 [0.148217, 0.180950] |
| encoding.ts | stream | decode | baseline | 0.208789 [0.185142, 0.226636] |
| encoding.ts | stream | decode | candidate | 0.203434 [0.176609, 0.217468] |
| encoding.ts | stream | decode | tiktoken | 0.173209 [0.167635, 0.213993] |
| encoding.ts | stream | decode | @goliapkg/tiktoken-wasm | 0.172091 [0.153434, 0.194816] |
| packages.json | repeated | decode | baseline | 0.048764 [0.041891, 0.065953] |
| packages.json | repeated | decode | candidate | 0.048030 [0.042165, 0.065930] |
| packages.json | repeated | decode | tiktoken | 0.042556 [0.040948, 0.054885] |
| packages.json | repeated | decode | @goliapkg/tiktoken-wasm | 0.041078 [0.037160, 0.065466] |
| packages.json | stream | decode | baseline | 0.044267 [0.041815, 0.063868] |
| packages.json | stream | decode | candidate | 0.043898 [0.042753, 0.054585] |
| packages.json | stream | decode | tiktoken | 0.055429 [0.043070, 0.068404] |
| packages.json | stream | decode | @goliapkg/tiktoken-wasm | 0.039247 [0.037021, 0.050569] |

## First-use and retained memory (unranked)

One complete document pass per fresh process before correctness/warmup. Document order is fixed, so individual first-use timings are order dependent. Initialization excludes engine startup and includes module import/factory. Heap/RSS deltas follow two event-loop turns and full GC. These are diagnostics; use the separate settled memory suite for publication.

| Entry | Initialization ms [min,max] | First-pass encode total ms [min,max] | Init heap delta MiB | First-pass heap delta MiB | First-pass RSS delta MiB |
|---|---:|---:|---:|---:|---:|
| baseline | 105.868 [105.122, 106.257] | 23.401 [21.345, 25.660] | 15.955 [15.955, 15.955] | 0.525 [0.525, 0.525] | 6.750 [6.625, 7.375] |
| candidate | 114.151 [105.215, 159.617] | 19.050 [18.565, 22.229] | 16.068 [16.068, 16.076] | 0.474 [0.469, 0.475] | 1.875 [1.250, 2.652] |
| tiktoken | 129.560 [126.787, 149.669] | 19.425 [19.048, 23.250] | 0.218 [0.218, 0.225] | 0.064 [0.063, 0.064] | -2.250 [-14.160, 2.645] |
| @goliapkg/tiktoken-wasm | 123.026 [120.130, 135.235] | 22.970 [20.714, 25.923] | 2.394 [2.391, 2.398] | 0.059 [0.056, 0.059] | 4.680 [1.469, 8.875] |

## Semantic probe mismatches

- baseline: {"text":" I'ſa","ids":false,"roundTrip":true,"count":false}
- baseline: {"text":"𲨓?t","ids":false,"roundTrip":true,"count":false}
- @goliapkg/tiktoken-wasm: {"text":" I'ſa","ids":false,"roundTrip":true,"count":false}

All timed documents and all 32 variants passed exact token IDs, count, and round-trip gates against independent tiktoken in every worker. Semantic probes above are additional non-timed cases; their failures remain disclosed.
