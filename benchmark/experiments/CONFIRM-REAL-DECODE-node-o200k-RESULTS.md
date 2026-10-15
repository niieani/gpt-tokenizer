# Optimization experiment (publication budget)

Node v26.12.0; o200k_base; 5 fresh processes per entry. Corpus 2a3a4eb1b0b9fc382f0a616157cae01fb95a74cf727ba7427a8576141fcd0542.

Output consumer: length; length consumes only output length, while full includes a complete output checksum. They are separate metrics.

Speedup is baseline npm latency / entry latency, geometric mean of equally weighted documents within each named category. Each process gives one category ratio; report its median [min, max]. Ranks are category/mode/operation specific; baseline npm is an unranked historical release reference. The 32-request stream is bounded and repeatedly cycled, so it measures changing requests with shared vocabulary, not unlimited unique text. No synthetic-dominated grand mean is used.

| Category | Mode | Operation | Entry | Rank | Speedup vs npm median [min,max] |
|---|---|---|---|---:|---:|
| prose | repeated | decode | ai-tokenizer | 1 | 1.026× [0.974, 1.094] |
| prose | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| prose | repeated | decode | candidate | 2 | 0.809× [0.781, 0.910] |
| prose | stream | decode | ai-tokenizer | 1 | 1.029× [1.010, 1.087] |
| prose | stream | decode | baseline | — | 1.000× [1.000, 1.000] |
| prose | stream | decode | candidate | 2 | 0.863× [0.789, 0.870] |
| code | repeated | decode | ai-tokenizer | 1 | 1.026× [0.999, 1.125] |
| code | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| code | repeated | decode | candidate | 2 | 0.812× [0.802, 0.939] |
| code | stream | decode | ai-tokenizer | 1 | 1.049× [1.012, 1.126] |
| code | stream | decode | baseline | — | 1.000× [1.000, 1.000] |
| code | stream | decode | candidate | 2 | 0.854× [0.794, 0.881] |
| structured | repeated | decode | ai-tokenizer | 1 | 1.067× [1.057, 1.076] |
| structured | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| structured | repeated | decode | candidate | 2 | 0.827× [0.810, 0.882] |
| structured | stream | decode | ai-tokenizer | 1 | 1.077× [1.040, 1.114] |
| structured | stream | decode | baseline | — | 1.000× [1.000, 1.000] |
| structured | stream | decode | candidate | 2 | 0.812× [0.798, 0.852] |
| multilingual | repeated | decode | candidate | 1 | 1.034× [0.981, 1.100] |
| multilingual | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| multilingual | repeated | decode | ai-tokenizer | 2 | 0.927× [0.915, 0.997] |
| multilingual | stream | decode | candidate | 1 | 1.069× [1.018, 1.155] |
| multilingual | stream | decode | baseline | — | 1.000× [1.000, 1.000] |
| multilingual | stream | decode | ai-tokenizer | 2 | 0.980× [0.916, 1.022] |
| long-prose | repeated | decode | candidate | 1 | 1.107× [1.048, 1.262] |
| long-prose | repeated | decode | ai-tokenizer | 2 | 1.094× [1.059, 1.182] |
| long-prose | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| long-prose | stream | decode | candidate | 1 | 1.091× [1.025, 1.328] |
| long-prose | stream | decode | ai-tokenizer | 2 | 1.050× [0.929, 1.172] |
| long-prose | stream | decode | baseline | — | 1.000× [1.000, 1.000] |
| long-code | repeated | decode | ai-tokenizer | 1 | 1.087× [1.064, 1.115] |
| long-code | repeated | decode | candidate | 2 | 1.041× [0.998, 1.108] |
| long-code | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| long-code | stream | decode | ai-tokenizer | 1 | 1.106× [1.022, 1.156] |
| long-code | stream | decode | candidate | 2 | 1.054× [1.028, 1.104] |
| long-code | stream | decode | baseline | — | 1.000× [1.000, 1.000] |
| long-structured | repeated | decode | ai-tokenizer | 1 | 1.107× [0.994, 1.184] |
| long-structured | repeated | decode | candidate | 2 | 1.073× [0.973, 1.095] |
| long-structured | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| long-structured | stream | decode | ai-tokenizer | 1 | 1.102× [1.080, 1.143] |
| long-structured | stream | decode | candidate | 2 | 1.090× [1.003, 1.120] |
| long-structured | stream | decode | baseline | — | 1.000× [1.000, 1.000] |

## Per-document latency

Median [min,max] milliseconds across fresh processes. Use these rows to inspect whether a category gain hides a particular regression.

| Document | Mode | Operation | Entry | ms median [min,max] |
|---|---|---|---|---:|
| support | repeated | decode | baseline | 0.000399 [0.000387, 0.000446] |
| support | repeated | decode | candidate | 0.000504 [0.000474, 0.000528] |
| support | repeated | decode | ai-tokenizer | 0.000404 [0.000394, 0.000446] |
| support | stream | decode | baseline | 0.000554 [0.000541, 0.000593] |
| support | stream | decode | candidate | 0.000663 [0.000623, 0.000695] |
| support | stream | decode | ai-tokenizer | 0.000547 [0.000529, 0.000557] |
| design | repeated | decode | baseline | 0.000442 [0.000429, 0.000525] |
| design | repeated | decode | candidate | 0.000547 [0.000512, 0.000550] |
| design | repeated | decode | ai-tokenizer | 0.000446 [0.000428, 0.000497] |
| design | stream | decode | baseline | 0.000589 [0.000581, 0.000651] |
| design | stream | decode | candidate | 0.000675 [0.000659, 0.000729] |
| design | stream | decode | ai-tokenizer | 0.000561 [0.000537, 0.000662] |
| release | repeated | decode | baseline | 0.000513 [0.000499, 0.000523] |
| release | repeated | decode | candidate | 0.000660 [0.000619, 0.000669] |
| release | repeated | decode | ai-tokenizer | 0.000465 [0.000461, 0.000512] |
| release | stream | decode | baseline | 0.000624 [0.000606, 0.000654] |
| release | stream | decode | candidate | 0.000781 [0.000744, 0.000856] |
| release | stream | decode | ai-tokenizer | 0.000606 [0.000587, 0.000629] |
| typescript | repeated | decode | baseline | 0.000605 [0.000587, 0.000677] |
| typescript | repeated | decode | candidate | 0.000744 [0.000683, 0.000775] |
| typescript | repeated | decode | ai-tokenizer | 0.000583 [0.000566, 0.000595] |
| typescript | stream | decode | baseline | 0.000750 [0.000714, 0.000807] |
| typescript | stream | decode | candidate | 0.000878 [0.000831, 0.000962] |
| typescript | stream | decode | ai-tokenizer | 0.000682 [0.000661, 0.000851] |
| python | repeated | decode | baseline | 0.000485 [0.000471, 0.000551] |
| python | repeated | decode | candidate | 0.000586 [0.000577, 0.000620] |
| python | repeated | decode | ai-tokenizer | 0.000473 [0.000451, 0.000487] |
| python | stream | decode | baseline | 0.000644 [0.000600, 0.000664] |
| python | stream | decode | candidate | 0.000752 [0.000744, 0.000783] |
| python | stream | decode | ai-tokenizer | 0.000573 [0.000563, 0.000598] |
| sql | repeated | decode | baseline | 0.000469 [0.000454, 0.000488] |
| sql | repeated | decode | candidate | 0.000559 [0.000547, 0.000602] |
| sql | repeated | decode | ai-tokenizer | 0.000457 [0.000439, 0.000501] |
| sql | stream | decode | baseline | 0.000598 [0.000574, 0.000661] |
| sql | stream | decode | candidate | 0.000728 [0.000690, 0.000767] |
| sql | stream | decode | ai-tokenizer | 0.000590 [0.000573, 0.000603] |
| api-json | repeated | decode | baseline | 0.000541 [0.000525, 0.000585] |
| api-json | repeated | decode | candidate | 0.000658 [0.000627, 0.000681] |
| api-json | repeated | decode | ai-tokenizer | 0.000508 [0.000500, 0.000563] |
| api-json | stream | decode | baseline | 0.000685 [0.000655, 0.000738] |
| api-json | stream | decode | candidate | 0.000817 [0.000754, 0.000843] |
| api-json | stream | decode | ai-tokenizer | 0.000639 [0.000625, 0.000650] |
| chat-json | repeated | decode | baseline | 0.000573 [0.000568, 0.000672] |
| chat-json | repeated | decode | candidate | 0.000734 [0.000717, 0.000739] |
| chat-json | repeated | decode | ai-tokenizer | 0.000541 [0.000530, 0.000560] |
| chat-json | stream | decode | baseline | 0.000720 [0.000710, 0.000750] |
| chat-json | stream | decode | candidate | 0.000879 [0.000836, 0.000944] |
| chat-json | stream | decode | ai-tokenizer | 0.000669 [0.000646, 0.000728] |
| logs | repeated | decode | baseline | 0.000811 [0.000788, 0.000853] |
| logs | repeated | decode | candidate | 0.000943 [0.000920, 0.000953] |
| logs | repeated | decode | ai-tokenizer | 0.000789 [0.000728, 0.000839] |
| logs | stream | decode | baseline | 0.000928 [0.000920, 0.000965] |
| logs | stream | decode | candidate | 0.001194 [0.001140, 0.001242] |
| logs | stream | decode | ai-tokenizer | 0.000886 [0.000858, 0.000931] |
| cjk | repeated | decode | baseline | 0.000718 [0.000696, 0.000756] |
| cjk | repeated | decode | candidate | 0.000853 [0.000826, 0.000881] |
| cjk | repeated | decode | ai-tokenizer | 0.000662 [0.000647, 0.000703] |
| cjk | stream | decode | baseline | 0.000839 [0.000809, 0.000948] |
| cjk | stream | decode | candidate | 0.001007 [0.000983, 0.001026] |
| cjk | stream | decode | ai-tokenizer | 0.000796 [0.000758, 0.000816] |
| european | repeated | decode | baseline | 0.000606 [0.000598, 0.000651] |
| european | repeated | decode | candidate | 0.000787 [0.000764, 0.000829] |
| european | repeated | decode | ai-tokenizer | 0.000609 [0.000585, 0.000646] |
| european | stream | decode | baseline | 0.000787 [0.000754, 0.000813] |
| european | stream | decode | candidate | 0.000931 [0.000880, 0.000946] |
| european | stream | decode | ai-tokenizer | 0.000716 [0.000691, 0.000811] |
| mixed | repeated | decode | baseline | 0.007697 [0.007161, 0.008298] |
| mixed | repeated | decode | candidate | 0.004532 [0.004191, 0.005170] |
| mixed | repeated | decode | ai-tokenizer | 0.009747 [0.009136, 0.011305] |
| mixed | stream | decode | baseline | 0.008418 [0.006954, 0.008860] |
| mixed | stream | decode | candidate | 0.004778 [0.004277, 0.004927] |
| mixed | stream | decode | ai-tokenizer | 0.010062 [0.009470, 0.010970] |
| readme.md | repeated | decode | baseline | 0.037240 [0.036269, 0.043072] |
| readme.md | repeated | decode | candidate | 0.033730 [0.032760, 0.035463] |
| readme.md | repeated | decode | ai-tokenizer | 0.034244 [0.034040, 0.036433] |
| readme.md | stream | decode | baseline | 0.037681 [0.036837, 0.045261] |
| readme.md | stream | decode | candidate | 0.034349 [0.033952, 0.038696] |
| readme.md | stream | decode | ai-tokenizer | 0.036257 [0.034624, 0.042697] |
| encoding.ts | repeated | decode | baseline | 0.036234 [0.034671, 0.037834] |
| encoding.ts | repeated | decode | candidate | 0.034214 [0.032714, 0.037910] |
| encoding.ts | repeated | decode | ai-tokenizer | 0.033682 [0.032124, 0.034318] |
| encoding.ts | stream | decode | baseline | 0.036292 [0.035801, 0.037363] |
| encoding.ts | stream | decode | candidate | 0.034436 [0.033300, 0.035304] |
| encoding.ts | stream | decode | ai-tokenizer | 0.032642 [0.032263, 0.035034] |
| packages.json | repeated | decode | baseline | 0.012730 [0.012247, 0.013210] |
| packages.json | repeated | decode | candidate | 0.012061 [0.011859, 0.012590] |
| packages.json | repeated | decode | ai-tokenizer | 0.011496 [0.011160, 0.012318] |
| packages.json | stream | decode | baseline | 0.013274 [0.012761, 0.013423] |
| packages.json | stream | decode | candidate | 0.012177 [0.011943, 0.012726] |
| packages.json | stream | decode | ai-tokenizer | 0.011808 [0.011715, 0.012141] |

## First-use and retained memory (unranked)

One complete document pass per fresh process before correctness/warmup. Document order is fixed, so individual first-use timings are order dependent. Initialization excludes engine startup and includes module import/factory. Heap/RSS deltas follow two event-loop turns and full GC. These are diagnostics; use the separate settled memory suite for publication.

| Entry | Initialization ms [min,max] | First-pass encode total ms [min,max] | Init heap delta MiB | First-pass heap delta MiB | First-pass RSS delta MiB |
|---|---:|---:|---:|---:|---:|
| baseline | 118.020 [104.373, 122.654] | 27.727 [24.517, 29.640] | 15.955 [15.952, 15.955] | 0.525 [0.525, 0.528] | 6.625 [6.227, 8.980] |
| candidate | 119.284 [117.072, 120.462] | 20.931 [19.828, 24.672] | 16.068 [16.067, 16.072] | 0.474 [0.474, 0.480] | 1.875 [1.777, 2.625] |
| ai-tokenizer | 327.309 [307.825, 343.951] | 20.906 [19.698, 25.581] | 26.806 [26.806, 26.806] | 0.455 [0.454, 0.468] | -11.121 [-12.145, -10.418] |

## Semantic probe mismatches

- baseline: {"text":" I'ſa","ids":false,"roundTrip":true,"count":false}
- baseline: {"text":"𲨓?t","ids":false,"roundTrip":true,"count":false}
- ai-tokenizer: {"text":" I'ſa","ids":false,"roundTrip":true,"count":false}
- ai-tokenizer: {"text":"𲨓?t","ids":false,"roundTrip":true,"count":false}
- ai-tokenizer: {"text":"﻿hello","ids":false,"roundTrip":false,"count":false}
- ai-tokenizer: {"text":"ab﻿c d","ids":false,"roundTrip":false,"count":false}

All timed documents and all 32 variants passed exact token IDs, count, and round-trip gates against independent tiktoken in every worker. Semantic probes above are additional non-timed cases; their failures remain disclosed.
