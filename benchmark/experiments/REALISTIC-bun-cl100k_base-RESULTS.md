# Optimization experiment (publication budget)

Bun 1.4.3; cl100k_base; 5 fresh processes per entry. Corpus 2a3a4eb1b0b9fc382f0a616157cae01fb95a74cf727ba7427a8576141fcd0542.

Output consumer: length; length consumes only output length, while full includes a complete output checksum. They are separate metrics.

Speedup is baseline npm latency / entry latency, geometric mean of equally weighted documents within each named category. Each process gives one category ratio; report its median [min, max]. Ranks are category/mode/operation specific; baseline npm is an unranked historical release reference. The 32-request stream is bounded and repeatedly cycled, so it measures changing requests with shared vocabulary, not unlimited unique text. No synthetic-dominated grand mean is used.

| Category | Mode | Operation | Entry | Rank | Speedup vs npm median [min,max] |
|---|---|---|---|---:|---:|
| prose | repeated | encode | candidate | 1 | 1.488× [1.359, 1.530] |
| prose | repeated | encode | baseline | — | 1.000× [1.000, 1.000] |
| prose | repeated | decode | candidate | 1 | 1.027× [0.792, 1.096] |
| prose | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| prose | repeated | count | candidate | 1 | 1.430× [1.328, 1.432] |
| prose | repeated | count | baseline | — | 1.000× [1.000, 1.000] |
| prose | stream | encode | candidate | 1 | 1.371× [1.237, 1.583] |
| prose | stream | encode | baseline | — | 1.000× [1.000, 1.000] |
| prose | stream | decode | candidate | 1 | 1.063× [0.918, 1.275] |
| prose | stream | decode | baseline | — | 1.000× [1.000, 1.000] |
| prose | stream | count | candidate | 1 | 1.421× [1.403, 1.476] |
| prose | stream | count | baseline | — | 1.000× [1.000, 1.000] |
| code | repeated | encode | candidate | 1 | 1.640× [1.580, 1.787] |
| code | repeated | encode | baseline | — | 1.000× [1.000, 1.000] |
| code | repeated | decode | candidate | 1 | 1.040× [1.016, 1.086] |
| code | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| code | repeated | count | candidate | 1 | 1.655× [1.476, 1.906] |
| code | repeated | count | baseline | — | 1.000× [1.000, 1.000] |
| code | stream | encode | candidate | 1 | 1.648× [1.501, 1.774] |
| code | stream | encode | baseline | — | 1.000× [1.000, 1.000] |
| code | stream | decode | baseline | — | 1.000× [1.000, 1.000] |
| code | stream | decode | candidate | 1 | 0.938× [0.804, 1.078] |
| code | stream | count | candidate | 1 | 1.674× [1.521, 1.717] |
| code | stream | count | baseline | — | 1.000× [1.000, 1.000] |
| structured | repeated | encode | candidate | 1 | 1.678× [1.638, 1.927] |
| structured | repeated | encode | baseline | — | 1.000× [1.000, 1.000] |
| structured | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| structured | repeated | decode | candidate | 1 | 0.865× [0.762, 0.959] |
| structured | repeated | count | candidate | 1 | 1.668× [1.389, 1.966] |
| structured | repeated | count | baseline | — | 1.000× [1.000, 1.000] |
| structured | stream | encode | candidate | 1 | 1.929× [1.553, 1.980] |
| structured | stream | encode | baseline | — | 1.000× [1.000, 1.000] |
| structured | stream | decode | baseline | — | 1.000× [1.000, 1.000] |
| structured | stream | decode | candidate | 1 | 0.960× [0.922, 1.067] |
| structured | stream | count | candidate | 1 | 1.605× [1.286, 1.726] |
| structured | stream | count | baseline | — | 1.000× [1.000, 1.000] |
| multilingual | repeated | encode | candidate | 1 | 2.283× [1.925, 2.484] |
| multilingual | repeated | encode | baseline | — | 1.000× [1.000, 1.000] |
| multilingual | repeated | decode | candidate | 1 | 1.750× [1.582, 1.780] |
| multilingual | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| multilingual | repeated | count | candidate | 1 | 2.108× [2.028, 2.590] |
| multilingual | repeated | count | baseline | — | 1.000× [1.000, 1.000] |
| multilingual | stream | encode | candidate | 1 | 2.134× [1.846, 2.502] |
| multilingual | stream | encode | baseline | — | 1.000× [1.000, 1.000] |
| multilingual | stream | decode | candidate | 1 | 2.081× [1.530, 2.242] |
| multilingual | stream | decode | baseline | — | 1.000× [1.000, 1.000] |
| multilingual | stream | count | candidate | 1 | 1.956× [1.683, 2.050] |
| multilingual | stream | count | baseline | — | 1.000× [1.000, 1.000] |
| long-prose | repeated | encode | candidate | 1 | 1.207× [0.860, 1.286] |
| long-prose | repeated | encode | baseline | — | 1.000× [1.000, 1.000] |
| long-prose | repeated | decode | candidate | 1 | 1.058× [0.932, 1.146] |
| long-prose | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| long-prose | repeated | count | candidate | 1 | 1.204× [1.049, 1.252] |
| long-prose | repeated | count | baseline | — | 1.000× [1.000, 1.000] |
| long-prose | stream | encode | candidate | 1 | 1.301× [1.198, 1.990] |
| long-prose | stream | encode | baseline | — | 1.000× [1.000, 1.000] |
| long-prose | stream | decode | candidate | 1 | 1.068× [1.003, 1.183] |
| long-prose | stream | decode | baseline | — | 1.000× [1.000, 1.000] |
| long-prose | stream | count | candidate | 1 | 1.135× [1.045, 1.435] |
| long-prose | stream | count | baseline | — | 1.000× [1.000, 1.000] |
| long-code | repeated | encode | candidate | 1 | 1.831× [1.513, 2.068] |
| long-code | repeated | encode | baseline | — | 1.000× [1.000, 1.000] |
| long-code | repeated | decode | candidate | 1 | 1.267× [1.054, 1.453] |
| long-code | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| long-code | repeated | count | candidate | 1 | 1.622× [1.184, 2.173] |
| long-code | repeated | count | baseline | — | 1.000× [1.000, 1.000] |
| long-code | stream | encode | candidate | 1 | 1.752× [1.550, 2.624] |
| long-code | stream | encode | baseline | — | 1.000× [1.000, 1.000] |
| long-code | stream | decode | candidate | 1 | 1.026× [0.746, 1.515] |
| long-code | stream | decode | baseline | — | 1.000× [1.000, 1.000] |
| long-code | stream | count | candidate | 1 | 1.594× [1.273, 1.764] |
| long-code | stream | count | baseline | — | 1.000× [1.000, 1.000] |
| long-structured | repeated | encode | candidate | 1 | 1.888× [1.441, 2.178] |
| long-structured | repeated | encode | baseline | — | 1.000× [1.000, 1.000] |
| long-structured | repeated | decode | candidate | 1 | 1.138× [0.763, 1.386] |
| long-structured | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| long-structured | repeated | count | candidate | 1 | 1.539× [0.850, 1.866] |
| long-structured | repeated | count | baseline | — | 1.000× [1.000, 1.000] |
| long-structured | stream | encode | candidate | 1 | 1.756× [1.586, 2.154] |
| long-structured | stream | encode | baseline | — | 1.000× [1.000, 1.000] |
| long-structured | stream | decode | baseline | — | 1.000× [1.000, 1.000] |
| long-structured | stream | decode | candidate | 1 | 0.969× [0.634, 1.460] |
| long-structured | stream | count | candidate | 1 | 1.756× [1.547, 1.982] |
| long-structured | stream | count | baseline | — | 1.000× [1.000, 1.000] |

## Per-document latency

Median [min,max] milliseconds across fresh processes. Use these rows to inspect whether a category gain hides a particular regression.

| Document | Mode | Operation | Entry | ms median [min,max] |
|---|---|---|---|---:|
| support | repeated | encode | baseline | 0.008796 [0.008533, 0.009277] |
| support | repeated | encode | candidate | 0.006249 [0.005970, 0.006989] |
| support | repeated | decode | baseline | 0.000859 [0.000792, 0.000992] |
| support | repeated | decode | candidate | 0.000849 [0.000793, 0.001090] |
| support | repeated | count | baseline | 0.007944 [0.007581, 0.010408] |
| support | repeated | count | candidate | 0.005962 [0.005481, 0.008951] |
| support | stream | encode | baseline | 0.010498 [0.009744, 0.011189] |
| support | stream | encode | candidate | 0.007929 [0.007331, 0.011631] |
| support | stream | decode | baseline | 0.001076 [0.001057, 0.001713] |
| support | stream | decode | candidate | 0.001161 [0.001057, 0.001319] |
| support | stream | count | baseline | 0.009297 [0.009179, 0.009906] |
| support | stream | count | candidate | 0.007336 [0.006892, 0.007944] |
| design | repeated | encode | baseline | 0.007058 [0.006292, 0.007500] |
| design | repeated | encode | candidate | 0.005035 [0.004945, 0.005657] |
| design | repeated | decode | baseline | 0.001007 [0.000870, 0.001062] |
| design | repeated | decode | candidate | 0.000946 [0.000898, 0.001401] |
| design | repeated | count | baseline | 0.006183 [0.005991, 0.007222] |
| design | repeated | count | candidate | 0.005124 [0.004504, 0.005420] |
| design | stream | encode | baseline | 0.008022 [0.007831, 0.009923] |
| design | stream | encode | candidate | 0.006236 [0.005876, 0.009349] |
| design | stream | decode | baseline | 0.001352 [0.001056, 0.002568] |
| design | stream | decode | candidate | 0.001197 [0.001132, 0.001225] |
| design | stream | count | baseline | 0.007505 [0.007146, 0.008375] |
| design | stream | count | candidate | 0.005445 [0.005372, 0.006411] |
| release | repeated | encode | baseline | 0.009506 [0.008767, 0.010051] |
| release | repeated | encode | candidate | 0.005649 [0.005521, 0.005704] |
| release | repeated | decode | baseline | 0.001082 [0.000985, 0.001214] |
| release | repeated | decode | candidate | 0.001070 [0.000989, 0.001211] |
| release | repeated | count | baseline | 0.008861 [0.008516, 0.009244] |
| release | repeated | count | candidate | 0.005362 [0.005198, 0.006638] |
| release | stream | encode | baseline | 0.012037 [0.010748, 0.014234] |
| release | stream | encode | candidate | 0.006718 [0.006544, 0.006841] |
| release | stream | decode | baseline | 0.001375 [0.001209, 0.001838] |
| release | stream | decode | candidate | 0.001381 [0.001278, 0.001420] |
| release | stream | count | baseline | 0.011215 [0.009669, 0.012070] |
| release | stream | count | candidate | 0.006205 [0.006137, 0.006744] |
| typescript | repeated | encode | baseline | 0.010825 [0.010349, 0.015739] |
| typescript | repeated | encode | candidate | 0.006226 [0.005808, 0.006901] |
| typescript | repeated | decode | baseline | 0.001293 [0.001211, 0.001454] |
| typescript | repeated | decode | candidate | 0.001263 [0.001160, 0.001332] |
| typescript | repeated | count | baseline | 0.010150 [0.009402, 0.012303] |
| typescript | repeated | count | candidate | 0.005936 [0.005293, 0.007362] |
| typescript | stream | encode | baseline | 0.012347 [0.012175, 0.013052] |
| typescript | stream | encode | candidate | 0.007808 [0.006854, 0.009279] |
| typescript | stream | decode | baseline | 0.001591 [0.001438, 0.001702] |
| typescript | stream | decode | candidate | 0.001542 [0.001419, 0.002760] |
| typescript | stream | count | baseline | 0.012053 [0.011533, 0.013289] |
| typescript | stream | count | candidate | 0.006972 [0.006606, 0.009778] |
| python | repeated | encode | baseline | 0.008729 [0.008368, 0.009589] |
| python | repeated | encode | candidate | 0.005691 [0.005274, 0.006147] |
| python | repeated | decode | baseline | 0.001236 [0.001005, 0.001281] |
| python | repeated | decode | candidate | 0.001083 [0.001043, 0.001221] |
| python | repeated | count | baseline | 0.008763 [0.007489, 0.009793] |
| python | repeated | count | candidate | 0.005409 [0.005036, 0.006108] |
| python | stream | encode | baseline | 0.010568 [0.010079, 0.011063] |
| python | stream | encode | candidate | 0.006548 [0.006457, 0.007480] |
| python | stream | decode | baseline | 0.001187 [0.001129, 0.001195] |
| python | stream | decode | candidate | 0.001301 [0.001226, 0.001430] |
| python | stream | count | baseline | 0.009757 [0.008933, 0.011082] |
| python | stream | count | candidate | 0.006063 [0.005979, 0.006327] |
| sql | repeated | encode | baseline | 0.007370 [0.007285, 0.008177] |
| sql | repeated | encode | candidate | 0.004607 [0.004560, 0.005467] |
| sql | repeated | decode | baseline | 0.000970 [0.000880, 0.001246] |
| sql | repeated | decode | candidate | 0.000978 [0.000944, 0.001065] |
| sql | repeated | count | baseline | 0.007329 [0.006772, 0.009190] |
| sql | repeated | count | candidate | 0.004357 [0.003985, 0.005562] |
| sql | stream | encode | baseline | 0.009365 [0.008876, 0.010635] |
| sql | stream | encode | candidate | 0.005514 [0.005457, 0.005867] |
| sql | stream | decode | baseline | 0.001204 [0.001106, 0.001489] |
| sql | stream | decode | candidate | 0.001198 [0.001109, 0.001517] |
| sql | stream | count | baseline | 0.008843 [0.008225, 0.010318] |
| sql | stream | count | candidate | 0.005875 [0.004925, 0.005986] |
| api-json | repeated | encode | baseline | 0.008192 [0.008149, 0.009281] |
| api-json | repeated | encode | candidate | 0.005004 [0.004766, 0.006341] |
| api-json | repeated | decode | baseline | 0.001034 [0.001009, 0.001083] |
| api-json | repeated | decode | candidate | 0.001132 [0.001033, 0.001652] |
| api-json | repeated | count | baseline | 0.009797 [0.007700, 0.010465] |
| api-json | repeated | count | candidate | 0.005253 [0.004638, 0.005388] |
| api-json | stream | encode | baseline | 0.009886 [0.009542, 0.013207] |
| api-json | stream | encode | candidate | 0.005924 [0.005721, 0.006136] |
| api-json | stream | decode | baseline | 0.001407 [0.001270, 0.001487] |
| api-json | stream | decode | candidate | 0.001449 [0.001237, 0.001505] |
| api-json | stream | count | baseline | 0.009023 [0.008699, 0.009932] |
| api-json | stream | count | candidate | 0.005977 [0.005169, 0.008039] |
| chat-json | repeated | encode | baseline | 0.011603 [0.010261, 0.012518] |
| chat-json | repeated | encode | candidate | 0.006651 [0.005975, 0.007612] |
| chat-json | repeated | decode | baseline | 0.001237 [0.001157, 0.001576] |
| chat-json | repeated | decode | candidate | 0.001311 [0.001204, 0.001409] |
| chat-json | repeated | count | baseline | 0.009946 [0.009714, 0.009971] |
| chat-json | repeated | count | candidate | 0.005856 [0.005570, 0.006777] |
| chat-json | stream | encode | baseline | 0.012258 [0.011814, 0.017265] |
| chat-json | stream | encode | candidate | 0.006861 [0.006582, 0.009425] |
| chat-json | stream | decode | baseline | 0.001532 [0.001484, 0.001581] |
| chat-json | stream | decode | candidate | 0.001544 [0.001416, 0.001899] |
| chat-json | stream | count | baseline | 0.011983 [0.011191, 0.012295] |
| chat-json | stream | count | candidate | 0.008095 [0.006500, 0.011348] |
| logs | repeated | encode | baseline | 0.013179 [0.012167, 0.014271] |
| logs | repeated | encode | candidate | 0.007077 [0.006713, 0.007322] |
| logs | repeated | decode | baseline | 0.001593 [0.001549, 0.001718] |
| logs | repeated | decode | candidate | 0.002030 [0.001576, 0.002820] |
| logs | repeated | count | baseline | 0.010338 [0.010138, 0.012143] |
| logs | repeated | count | candidate | 0.006144 [0.006013, 0.008323] |
| logs | stream | encode | baseline | 0.014972 [0.013953, 0.020205] |
| logs | stream | encode | candidate | 0.007730 [0.007541, 0.008202] |
| logs | stream | decode | baseline | 0.002084 [0.001800, 0.002143] |
| logs | stream | decode | candidate | 0.001926 [0.001863, 0.002042] |
| logs | stream | count | baseline | 0.013020 [0.012031, 0.013324] |
| logs | stream | count | candidate | 0.006944 [0.006745, 0.007672] |
| cjk | repeated | encode | baseline | 0.008500 [0.007793, 0.008657] |
| cjk | repeated | encode | candidate | 0.003407 [0.003267, 0.003547] |
| cjk | repeated | decode | baseline | 0.004410 [0.004349, 0.005185] |
| cjk | repeated | decode | candidate | 0.003776 [0.003226, 0.004189] |
| cjk | repeated | count | baseline | 0.006004 [0.005581, 0.006334] |
| cjk | repeated | count | candidate | 0.002773 [0.002494, 0.002934] |
| cjk | stream | encode | baseline | 0.010495 [0.009677, 0.012692] |
| cjk | stream | encode | candidate | 0.004816 [0.004545, 0.005082] |
| cjk | stream | decode | baseline | 0.005106 [0.004756, 0.006317] |
| cjk | stream | decode | candidate | 0.001903 [0.001857, 0.002688] |
| cjk | stream | count | baseline | 0.007816 [0.007594, 0.009453] |
| cjk | stream | count | candidate | 0.003784 [0.003686, 0.004337] |
| european | repeated | encode | baseline | 0.013683 [0.013094, 0.021376] |
| european | repeated | encode | candidate | 0.007487 [0.007369, 0.009637] |
| european | repeated | decode | baseline | 0.001865 [0.001803, 0.002547] |
| european | repeated | decode | candidate | 0.001817 [0.001766, 0.001897] |
| european | repeated | count | baseline | 0.012390 [0.011091, 0.012967] |
| european | repeated | count | candidate | 0.006591 [0.006191, 0.007055] |
| european | stream | encode | baseline | 0.017862 [0.016961, 0.018898] |
| european | stream | encode | candidate | 0.009013 [0.008579, 0.012236] |
| european | stream | decode | baseline | 0.002138 [0.002029, 0.002473] |
| european | stream | decode | candidate | 0.002178 [0.001996, 0.002704] |
| european | stream | count | baseline | 0.013350 [0.012980, 0.017266] |
| european | stream | count | candidate | 0.008033 [0.007536, 0.010899] |
| mixed | repeated | encode | baseline | 0.017466 [0.017215, 0.019413] |
| mixed | repeated | encode | candidate | 0.007627 [0.007602, 0.007910] |
| mixed | repeated | decode | baseline | 0.007690 [0.007513, 0.008494] |
| mixed | repeated | decode | candidate | 0.002102 [0.001987, 0.002429] |
| mixed | repeated | count | baseline | 0.016164 [0.014747, 0.026030] |
| mixed | repeated | count | candidate | 0.007079 [0.006625, 0.007966] |
| mixed | stream | encode | baseline | 0.022167 [0.019486, 0.024236] |
| mixed | stream | encode | candidate | 0.009217 [0.008719, 0.009761] |
| mixed | stream | decode | baseline | 0.007988 [0.007651, 0.009747] |
| mixed | stream | decode | candidate | 0.002301 [0.002147, 0.003325] |
| mixed | stream | count | baseline | 0.020190 [0.015788, 0.023414] |
| mixed | stream | count | candidate | 0.009089 [0.007929, 0.011671] |
| readme.md | repeated | encode | baseline | 0.880207 [0.846231, 1.035066] |
| readme.md | repeated | encode | candidate | 0.738142 [0.700928, 0.983670] |
| readme.md | repeated | decode | baseline | 0.073505 [0.066027, 0.074279] |
| readme.md | repeated | decode | candidate | 0.067424 [0.064446, 0.070882] |
| readme.md | repeated | count | baseline | 0.822765 [0.793667, 0.857721] |
| readme.md | repeated | count | candidate | 0.693350 [0.677260, 0.760117] |
| readme.md | stream | encode | baseline | 0.924576 [0.849273, 1.462645] |
| readme.md | stream | encode | candidate | 0.708782 [0.673408, 0.737978] |
| readme.md | stream | decode | baseline | 0.073643 [0.073375, 0.077523] |
| readme.md | stream | decode | candidate | 0.068684 [0.064162, 0.073445] |
| readme.md | stream | count | baseline | 0.796392 [0.737971, 0.917568] |
| readme.md | stream | count | candidate | 0.706228 [0.639524, 0.737819] |
| encoding.ts | repeated | encode | baseline | 0.782851 [0.660434, 0.951570] |
| encoding.ts | repeated | encode | candidate | 0.422319 [0.394160, 0.628966] |
| encoding.ts | repeated | decode | baseline | 0.080095 [0.071352, 0.087771] |
| encoding.ts | repeated | decode | candidate | 0.063476 [0.060399, 0.069938] |
| encoding.ts | repeated | count | baseline | 0.607922 [0.586352, 0.809440] |
| encoding.ts | repeated | count | candidate | 0.374754 [0.365489, 0.495217] |
| encoding.ts | stream | encode | baseline | 0.684355 [0.681215, 1.098659] |
| encoding.ts | stream | encode | candidate | 0.418645 [0.390724, 0.439973] |
| encoding.ts | stream | decode | baseline | 0.075327 [0.066286, 0.099755] |
| encoding.ts | stream | decode | candidate | 0.073398 [0.063932, 0.095728] |
| encoding.ts | stream | count | baseline | 0.627556 [0.614879, 0.664383] |
| encoding.ts | stream | count | candidate | 0.389794 [0.376624, 0.482883] |
| packages.json | repeated | encode | baseline | 0.222244 [0.197199, 0.249393] |
| packages.json | repeated | encode | candidate | 0.117691 [0.114047, 0.146067] |
| packages.json | repeated | decode | baseline | 0.026513 [0.024805, 0.033349] |
| packages.json | repeated | decode | candidate | 0.029306 [0.021299, 0.033856] |
| packages.json | repeated | count | baseline | 0.185884 [0.182173, 0.229430] |
| packages.json | repeated | count | candidate | 0.122924 [0.115705, 0.214291] |
| packages.json | stream | encode | baseline | 0.235094 [0.219928, 0.257490] |
| packages.json | stream | encode | candidate | 0.133156 [0.119533, 0.138658] |
| packages.json | stream | decode | baseline | 0.025409 [0.022989, 0.034443] |
| packages.json | stream | decode | candidate | 0.025940 [0.023599, 0.050277] |
| packages.json | stream | count | baseline | 0.191178 [0.189465, 0.227458] |
| packages.json | stream | count | candidate | 0.120433 [0.108845, 0.123353] |

## First-use and retained memory (unranked)

One complete document pass per fresh process before correctness/warmup. Document order is fixed, so individual first-use timings are order dependent. Initialization excludes engine startup and includes module import/factory. Heap/RSS deltas follow two event-loop turns and full GC. These are diagnostics; use the separate settled memory suite for publication.

| Entry | Initialization ms [min,max] | First-pass encode total ms [min,max] | Init heap delta MiB | First-pass heap delta MiB | First-pass RSS delta MiB |
|---|---:|---:|---:|---:|---:|
| baseline | 109.914 [102.337, 140.594] | 18.037 [15.083, 20.490] | 11.673 [11.670, 11.675] | 0.377 [0.372, 0.379] | 6.293 [4.895, 6.961] |
| candidate | 128.487 [102.196, 136.767] | 12.148 [11.948, 20.433] | 11.758 [11.757, 11.758] | 1.553 [1.551, 1.554] | 4.637 [3.348, 6.043] |

## Semantic probe mismatches

- baseline: {"text":"𲨓?t","ids":false,"roundTrip":true,"count":false}

All timed documents and all 32 variants passed exact token IDs, count, and round-trip gates against independent tiktoken in every worker. Semantic probes above are additional non-timed cases; their failures remain disclosed.
