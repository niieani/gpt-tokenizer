# Optimization experiment (publication budget)

Bun 1.4.3; o200k_base; 5 fresh processes per entry. Corpus 2a3a4eb1b0b9fc382f0a616157cae01fb95a74cf727ba7427a8576141fcd0542.

Output consumer: length; length consumes only output length, while full includes a complete output checksum. They are separate metrics.

Speedup is baseline npm latency / entry latency, geometric mean of equally weighted documents within each named category. Each process gives one category ratio; report its median [min, max]. Ranks are category/mode/operation specific; baseline npm is an unranked historical release reference. The 32-request stream is bounded and repeatedly cycled, so it measures changing requests with shared vocabulary, not unlimited unique text. No synthetic-dominated grand mean is used.

| Category | Mode | Operation | Entry | Rank | Speedup vs npm median [min,max] |
|---|---|---|---|---:|---:|
| prose | repeated | encode | candidate | 1 | 1.307× [1.007, 1.629] |
| prose | repeated | encode | baseline | — | 1.000× [1.000, 1.000] |
| prose | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| prose | repeated | decode | candidate | 1 | 0.936× [0.811, 1.004] |
| prose | repeated | count | candidate | 1 | 1.308× [1.160, 1.419] |
| prose | repeated | count | baseline | — | 1.000× [1.000, 1.000] |
| prose | stream | encode | candidate | 1 | 1.375× [1.303, 1.431] |
| prose | stream | encode | baseline | — | 1.000× [1.000, 1.000] |
| prose | stream | decode | baseline | — | 1.000× [1.000, 1.000] |
| prose | stream | decode | candidate | 1 | 0.967× [0.893, 1.098] |
| prose | stream | count | candidate | 1 | 1.381× [1.251, 1.634] |
| prose | stream | count | baseline | — | 1.000× [1.000, 1.000] |
| code | repeated | encode | candidate | 1 | 1.435× [1.301, 1.538] |
| code | repeated | encode | baseline | — | 1.000× [1.000, 1.000] |
| code | repeated | decode | candidate | 1 | 1.018× [0.902, 1.080] |
| code | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| code | repeated | count | candidate | 1 | 1.356× [1.278, 1.511] |
| code | repeated | count | baseline | — | 1.000× [1.000, 1.000] |
| code | stream | encode | candidate | 1 | 1.403× [1.097, 1.545] |
| code | stream | encode | baseline | — | 1.000× [1.000, 1.000] |
| code | stream | decode | baseline | — | 1.000× [1.000, 1.000] |
| code | stream | decode | candidate | 1 | 0.950× [0.903, 1.052] |
| code | stream | count | candidate | 1 | 1.348× [1.221, 1.652] |
| code | stream | count | baseline | — | 1.000× [1.000, 1.000] |
| structured | repeated | encode | candidate | 1 | 1.736× [1.693, 1.795] |
| structured | repeated | encode | baseline | — | 1.000× [1.000, 1.000] |
| structured | repeated | decode | candidate | 1 | 1.012× [0.881, 1.039] |
| structured | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| structured | repeated | count | candidate | 1 | 1.561× [1.448, 1.654] |
| structured | repeated | count | baseline | — | 1.000× [1.000, 1.000] |
| structured | stream | encode | candidate | 1 | 1.626× [1.516, 1.660] |
| structured | stream | encode | baseline | — | 1.000× [1.000, 1.000] |
| structured | stream | decode | candidate | 1 | 1.032× [0.832, 1.045] |
| structured | stream | decode | baseline | — | 1.000× [1.000, 1.000] |
| structured | stream | count | candidate | 1 | 1.517× [1.468, 1.738] |
| structured | stream | count | baseline | — | 1.000× [1.000, 1.000] |
| multilingual | repeated | encode | candidate | 1 | 1.811× [1.597, 1.864] |
| multilingual | repeated | encode | baseline | — | 1.000× [1.000, 1.000] |
| multilingual | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| multilingual | repeated | decode | candidate | 1 | 0.933× [0.894, 1.048] |
| multilingual | repeated | count | candidate | 1 | 1.603× [1.490, 1.699] |
| multilingual | repeated | count | baseline | — | 1.000× [1.000, 1.000] |
| multilingual | stream | encode | candidate | 1 | 1.771× [1.625, 2.468] |
| multilingual | stream | encode | baseline | — | 1.000× [1.000, 1.000] |
| multilingual | stream | decode | baseline | — | 1.000× [1.000, 1.000] |
| multilingual | stream | decode | candidate | 1 | 0.955× [0.890, 1.027] |
| multilingual | stream | count | candidate | 1 | 1.563× [1.455, 1.788] |
| multilingual | stream | count | baseline | — | 1.000× [1.000, 1.000] |
| long-prose | repeated | encode | candidate | 1 | 1.170× [0.899, 1.347] |
| long-prose | repeated | encode | baseline | — | 1.000× [1.000, 1.000] |
| long-prose | repeated | decode | candidate | 1 | 1.213× [0.971, 1.335] |
| long-prose | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| long-prose | repeated | count | candidate | 1 | 1.146× [1.054, 1.319] |
| long-prose | repeated | count | baseline | — | 1.000× [1.000, 1.000] |
| long-prose | stream | encode | candidate | 1 | 1.226× [1.067, 1.494] |
| long-prose | stream | encode | baseline | — | 1.000× [1.000, 1.000] |
| long-prose | stream | decode | candidate | 1 | 1.139× [1.030, 1.351] |
| long-prose | stream | decode | baseline | — | 1.000× [1.000, 1.000] |
| long-prose | stream | count | candidate | 1 | 1.121× [1.032, 1.164] |
| long-prose | stream | count | baseline | — | 1.000× [1.000, 1.000] |
| long-code | repeated | encode | candidate | 1 | 1.366× [1.270, 1.486] |
| long-code | repeated | encode | baseline | — | 1.000× [1.000, 1.000] |
| long-code | repeated | decode | candidate | 1 | 1.077× [1.032, 1.209] |
| long-code | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| long-code | repeated | count | candidate | 1 | 1.345× [1.311, 1.427] |
| long-code | repeated | count | baseline | — | 1.000× [1.000, 1.000] |
| long-code | stream | encode | candidate | 1 | 1.498× [1.287, 1.584] |
| long-code | stream | encode | baseline | — | 1.000× [1.000, 1.000] |
| long-code | stream | decode | candidate | 1 | 1.225× [1.053, 1.431] |
| long-code | stream | decode | baseline | — | 1.000× [1.000, 1.000] |
| long-code | stream | count | candidate | 1 | 1.342× [1.303, 1.581] |
| long-code | stream | count | baseline | — | 1.000× [1.000, 1.000] |
| long-structured | repeated | encode | candidate | 1 | 1.536× [1.441, 1.788] |
| long-structured | repeated | encode | baseline | — | 1.000× [1.000, 1.000] |
| long-structured | repeated | decode | candidate | 1 | 1.167× [0.881, 1.256] |
| long-structured | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| long-structured | repeated | count | candidate | 1 | 1.551× [1.480, 1.711] |
| long-structured | repeated | count | baseline | — | 1.000× [1.000, 1.000] |
| long-structured | stream | encode | candidate | 1 | 1.639× [1.550, 1.883] |
| long-structured | stream | encode | baseline | — | 1.000× [1.000, 1.000] |
| long-structured | stream | decode | candidate | 1 | 1.123× [0.961, 1.313] |
| long-structured | stream | decode | baseline | — | 1.000× [1.000, 1.000] |
| long-structured | stream | count | candidate | 1 | 1.573× [0.561, 1.780] |
| long-structured | stream | count | baseline | — | 1.000× [1.000, 1.000] |

## Per-document latency

Median [min,max] milliseconds across fresh processes. Use these rows to inspect whether a category gain hides a particular regression.

| Document | Mode | Operation | Entry | ms median [min,max] |
|---|---|---|---|---:|
| support | repeated | encode | baseline | 0.007911 [0.007840, 0.010841] |
| support | repeated | encode | candidate | 0.006901 [0.006418, 0.010137] |
| support | repeated | decode | baseline | 0.000810 [0.000764, 0.000889] |
| support | repeated | decode | candidate | 0.000908 [0.000803, 0.000994] |
| support | repeated | count | baseline | 0.007548 [0.007264, 0.009780] |
| support | repeated | count | candidate | 0.006241 [0.006080, 0.008423] |
| support | stream | encode | baseline | 0.009965 [0.009710, 0.011472] |
| support | stream | encode | candidate | 0.008122 [0.007776, 0.008392] |
| support | stream | decode | baseline | 0.001052 [0.001025, 0.001378] |
| support | stream | decode | candidate | 0.001153 [0.001056, 0.001220] |
| support | stream | count | baseline | 0.009510 [0.008901, 0.016758] |
| support | stream | count | candidate | 0.007735 [0.007599, 0.010741] |
| design | repeated | encode | baseline | 0.006215 [0.005876, 0.007801] |
| design | repeated | encode | candidate | 0.005020 [0.004939, 0.005178] |
| design | repeated | decode | baseline | 0.000900 [0.000861, 0.000981] |
| design | repeated | decode | candidate | 0.000976 [0.000915, 0.001124] |
| design | repeated | count | baseline | 0.006186 [0.005839, 0.006691] |
| design | repeated | count | candidate | 0.005193 [0.004813, 0.005634] |
| design | stream | encode | baseline | 0.008209 [0.007738, 0.009249] |
| design | stream | encode | candidate | 0.006382 [0.005878, 0.007083] |
| design | stream | decode | baseline | 0.001258 [0.001183, 0.001388] |
| design | stream | decode | candidate | 0.001150 [0.001129, 0.001234] |
| design | stream | count | baseline | 0.007685 [0.007348, 0.009010] |
| design | stream | count | candidate | 0.005908 [0.005704, 0.006264] |
| release | repeated | encode | baseline | 0.008581 [0.008150, 0.012112] |
| release | repeated | encode | candidate | 0.005858 [0.005460, 0.009334] |
| release | repeated | decode | baseline | 0.001015 [0.000950, 0.001228] |
| release | repeated | decode | candidate | 0.001051 [0.001029, 0.001430] |
| release | repeated | count | baseline | 0.008946 [0.007810, 0.011507] |
| release | repeated | count | candidate | 0.005573 [0.005516, 0.006220] |
| release | stream | encode | baseline | 0.010806 [0.009533, 0.011357] |
| release | stream | encode | candidate | 0.006581 [0.006459, 0.007023] |
| release | stream | decode | baseline | 0.001257 [0.001190, 0.001279] |
| release | stream | decode | candidate | 0.001378 [0.001222, 0.001750] |
| release | stream | count | baseline | 0.009493 [0.009124, 0.014478] |
| release | stream | count | candidate | 0.006665 [0.006217, 0.007419] |
| typescript | repeated | encode | baseline | 0.009444 [0.007963, 0.010475] |
| typescript | repeated | encode | candidate | 0.006609 [0.006175, 0.006750] |
| typescript | repeated | decode | baseline | 0.001197 [0.001153, 0.001295] |
| typescript | repeated | decode | candidate | 0.001224 [0.001137, 0.001459] |
| typescript | repeated | count | baseline | 0.007908 [0.007570, 0.009385] |
| typescript | repeated | count | candidate | 0.006319 [0.006071, 0.006687] |
| typescript | stream | encode | baseline | 0.010343 [0.009563, 0.012723] |
| typescript | stream | encode | candidate | 0.007686 [0.007151, 0.008878] |
| typescript | stream | decode | baseline | 0.001420 [0.001367, 0.001440] |
| typescript | stream | decode | candidate | 0.001462 [0.001378, 0.002052] |
| typescript | stream | count | baseline | 0.009761 [0.009141, 0.011965] |
| typescript | stream | count | candidate | 0.007749 [0.007273, 0.009696] |
| python | repeated | encode | baseline | 0.007936 [0.007580, 0.008212] |
| python | repeated | encode | candidate | 0.005543 [0.005396, 0.006767] |
| python | repeated | decode | baseline | 0.001036 [0.000979, 0.001084] |
| python | repeated | decode | candidate | 0.001042 [0.000977, 0.001211] |
| python | repeated | count | baseline | 0.007668 [0.007441, 0.007767] |
| python | repeated | count | candidate | 0.005563 [0.005244, 0.007199] |
| python | stream | encode | baseline | 0.009667 [0.009232, 0.010768] |
| python | stream | encode | candidate | 0.006709 [0.006513, 0.010826] |
| python | stream | decode | baseline | 0.001299 [0.001175, 0.001618] |
| python | stream | decode | candidate | 0.001234 [0.001223, 0.001472] |
| python | stream | count | baseline | 0.009388 [0.009016, 0.020174] |
| python | stream | count | candidate | 0.006436 [0.006415, 0.007014] |
| sql | repeated | encode | baseline | 0.006968 [0.006862, 0.008493] |
| sql | repeated | encode | candidate | 0.004916 [0.004780, 0.005092] |
| sql | repeated | decode | baseline | 0.001096 [0.000900, 0.001393] |
| sql | repeated | decode | candidate | 0.001078 [0.000872, 0.001210] |
| sql | repeated | count | baseline | 0.007523 [0.006558, 0.008069] |
| sql | repeated | count | candidate | 0.004843 [0.004545, 0.004962] |
| sql | stream | encode | baseline | 0.008639 [0.008572, 0.008948] |
| sql | stream | encode | candidate | 0.006219 [0.005892, 0.007418] |
| sql | stream | decode | baseline | 0.001165 [0.001103, 0.001351] |
| sql | stream | decode | candidate | 0.001195 [0.001140, 0.001299] |
| sql | stream | count | baseline | 0.008183 [0.007975, 0.011496] |
| sql | stream | count | candidate | 0.006223 [0.005772, 0.011774] |
| api-json | repeated | encode | baseline | 0.008526 [0.007988, 0.009144] |
| api-json | repeated | encode | candidate | 0.005199 [0.004910, 0.005256] |
| api-json | repeated | decode | baseline | 0.001141 [0.001122, 0.001162] |
| api-json | repeated | decode | candidate | 0.001105 [0.001046, 0.001496] |
| api-json | repeated | count | baseline | 0.007365 [0.007334, 0.007578] |
| api-json | repeated | count | candidate | 0.004877 [0.004774, 0.005498] |
| api-json | stream | encode | baseline | 0.010100 [0.009837, 0.010795] |
| api-json | stream | encode | candidate | 0.006104 [0.005866, 0.006536] |
| api-json | stream | decode | baseline | 0.001339 [0.001307, 0.001552] |
| api-json | stream | decode | candidate | 0.001337 [0.001263, 0.001497] |
| api-json | stream | count | baseline | 0.009316 [0.008978, 0.010981] |
| api-json | stream | count | candidate | 0.006425 [0.005677, 0.007261] |
| chat-json | repeated | encode | baseline | 0.011348 [0.010410, 0.012559] |
| chat-json | repeated | encode | candidate | 0.006146 [0.006047, 0.006389] |
| chat-json | repeated | decode | baseline | 0.001176 [0.001122, 0.001228] |
| chat-json | repeated | decode | candidate | 0.001173 [0.001111, 0.001204] |
| chat-json | repeated | count | baseline | 0.009633 [0.008582, 0.011381] |
| chat-json | repeated | count | candidate | 0.006062 [0.005746, 0.006334] |
| chat-json | stream | encode | baseline | 0.011851 [0.010805, 0.012462] |
| chat-json | stream | encode | candidate | 0.007052 [0.006967, 0.008914] |
| chat-json | stream | decode | baseline | 0.001535 [0.001347, 0.001663] |
| chat-json | stream | decode | candidate | 0.001545 [0.001377, 0.002200] |
| chat-json | stream | count | baseline | 0.010895 [0.010424, 0.013085] |
| chat-json | stream | count | candidate | 0.007188 [0.007018, 0.007705] |
| logs | repeated | encode | baseline | 0.011993 [0.011453, 0.013252] |
| logs | repeated | encode | candidate | 0.006897 [0.006695, 0.007764] |
| logs | repeated | decode | baseline | 0.001604 [0.001575, 0.001633] |
| logs | repeated | decode | candidate | 0.001604 [0.001579, 0.001790] |
| logs | repeated | count | baseline | 0.010181 [0.009844, 0.011513] |
| logs | repeated | count | candidate | 0.006684 [0.006262, 0.007135] |
| logs | stream | encode | baseline | 0.012921 [0.012835, 0.013406] |
| logs | stream | encode | candidate | 0.008186 [0.007860, 0.009122] |
| logs | stream | decode | baseline | 0.001819 [0.001733, 0.002931] |
| logs | stream | decode | candidate | 0.001940 [0.001830, 0.002339] |
| logs | stream | count | baseline | 0.011729 [0.011365, 0.012150] |
| logs | stream | count | candidate | 0.007321 [0.007021, 0.007808] |
| cjk | repeated | encode | baseline | 0.007039 [0.006640, 0.007270] |
| cjk | repeated | encode | candidate | 0.003335 [0.003269, 0.004340] |
| cjk | repeated | decode | baseline | 0.001281 [0.001249, 0.001559] |
| cjk | repeated | decode | candidate | 0.001333 [0.001200, 0.001573] |
| cjk | repeated | count | baseline | 0.006207 [0.005125, 0.006305] |
| cjk | repeated | count | candidate | 0.003120 [0.003038, 0.003354] |
| cjk | stream | encode | baseline | 0.009582 [0.009064, 0.011743] |
| cjk | stream | encode | candidate | 0.005019 [0.004682, 0.005921] |
| cjk | stream | decode | baseline | 0.001551 [0.001454, 0.001742] |
| cjk | stream | decode | candidate | 0.001619 [0.001542, 0.001679] |
| cjk | stream | count | baseline | 0.008393 [0.006893, 0.010462] |
| cjk | stream | count | candidate | 0.004604 [0.004265, 0.004868] |
| european | repeated | encode | baseline | 0.012024 [0.011050, 0.013863] |
| european | repeated | encode | candidate | 0.007107 [0.006964, 0.008225] |
| european | repeated | decode | baseline | 0.001142 [0.001092, 0.001382] |
| european | repeated | decode | candidate | 0.001231 [0.001164, 0.001238] |
| european | repeated | count | baseline | 0.010001 [0.009473, 0.011667] |
| european | repeated | count | candidate | 0.006900 [0.006682, 0.007892] |
| european | stream | encode | baseline | 0.014167 [0.013085, 0.016630] |
| european | stream | encode | candidate | 0.008506 [0.008494, 0.009123] |
| european | stream | decode | baseline | 0.001401 [0.001357, 0.001412] |
| european | stream | decode | candidate | 0.001482 [0.001373, 0.001881] |
| european | stream | count | baseline | 0.012196 [0.011697, 0.014096] |
| european | stream | count | candidate | 0.008525 [0.008258, 0.009837] |
| mixed | repeated | encode | baseline | 0.011111 [0.010615, 0.011827] |
| mixed | repeated | encode | candidate | 0.006541 [0.006294, 0.006759] |
| mixed | repeated | decode | baseline | 0.002059 [0.002000, 0.002161] |
| mixed | repeated | decode | candidate | 0.002148 [0.002048, 0.002515] |
| mixed | repeated | count | baseline | 0.009465 [0.008958, 0.011474] |
| mixed | repeated | count | candidate | 0.006812 [0.006149, 0.007128] |
| mixed | stream | encode | baseline | 0.014312 [0.013185, 0.025507] |
| mixed | stream | encode | candidate | 0.007842 [0.007635, 0.009354] |
| mixed | stream | decode | baseline | 0.002294 [0.002281, 0.002336] |
| mixed | stream | decode | candidate | 0.002424 [0.002299, 0.002623] |
| mixed | stream | count | baseline | 0.012119 [0.011612, 0.013433] |
| mixed | stream | count | candidate | 0.007867 [0.007539, 0.008512] |
| readme.md | repeated | encode | baseline | 0.926472 [0.893422, 1.077522] |
| readme.md | repeated | encode | candidate | 0.800216 [0.763528, 1.006163] |
| readme.md | repeated | decode | baseline | 0.084006 [0.069156, 0.088529] |
| readme.md | repeated | decode | candidate | 0.067266 [0.065096, 0.072984] |
| readme.md | repeated | count | baseline | 0.918792 [0.856838, 1.011828] |
| readme.md | repeated | count | candidate | 0.753643 [0.750073, 0.872308] |
| readme.md | stream | encode | baseline | 0.963815 [0.935107, 1.179783] |
| readme.md | stream | encode | candidate | 0.823157 [0.786151, 0.876172] |
| readme.md | stream | decode | baseline | 0.074310 [0.072280, 0.080946] |
| readme.md | stream | decode | candidate | 0.064871 [0.059931, 0.072157] |
| readme.md | stream | count | baseline | 0.871159 [0.849428, 0.958989] |
| readme.md | stream | count | candidate | 0.801709 [0.767391, 0.855684] |
| encoding.ts | repeated | encode | baseline | 0.731403 [0.687682, 0.765051] |
| encoding.ts | repeated | encode | candidate | 0.519967 [0.514722, 0.541949] |
| encoding.ts | repeated | decode | baseline | 0.072587 [0.064787, 0.080522] |
| encoding.ts | repeated | decode | candidate | 0.066590 [0.060169, 0.075902] |
| encoding.ts | repeated | count | baseline | 0.660417 [0.644079, 0.718578] |
| encoding.ts | repeated | count | candidate | 0.497606 [0.479601, 0.503616] |
| encoding.ts | stream | encode | baseline | 0.770527 [0.694681, 0.885322] |
| encoding.ts | stream | encode | candidate | 0.517962 [0.496547, 0.558889] |
| encoding.ts | stream | decode | baseline | 0.078638 [0.074877, 0.093106] |
| encoding.ts | stream | decode | candidate | 0.065072 [0.062287, 0.071093] |
| encoding.ts | stream | count | baseline | 0.665872 [0.629694, 0.796389] |
| encoding.ts | stream | count | candidate | 0.495438 [0.480929, 0.518299] |
| packages.json | repeated | encode | baseline | 0.214935 [0.198612, 0.220712] |
| packages.json | repeated | encode | candidate | 0.140750 [0.123427, 0.149149] |
| packages.json | repeated | decode | baseline | 0.025925 [0.025303, 0.027810] |
| packages.json | repeated | decode | candidate | 0.022212 [0.021359, 0.028715] |
| packages.json | repeated | count | baseline | 0.190558 [0.188443, 0.204594] |
| packages.json | repeated | count | candidate | 0.123367 [0.113215, 0.127908] |
| packages.json | stream | encode | baseline | 0.239216 [0.198063, 0.254155] |
| packages.json | stream | encode | candidate | 0.137852 [0.127286, 0.151633] |
| packages.json | stream | decode | baseline | 0.026804 [0.025091, 0.031375] |
| packages.json | stream | decode | candidate | 0.023902 [0.023171, 0.026912] |
| packages.json | stream | count | baseline | 0.193974 [0.181231, 0.228605] |
| packages.json | stream | count | candidate | 0.125338 [0.122603, 0.407648] |

## First-use and retained memory (unranked)

One complete document pass per fresh process before correctness/warmup. Document order is fixed, so individual first-use timings are order dependent. Initialization excludes engine startup and includes module import/factory. Heap/RSS deltas follow two event-loop turns and full GC. These are diagnostics; use the separate settled memory suite for publication.

| Entry | Initialization ms [min,max] | First-pass encode total ms [min,max] | Init heap delta MiB | First-pass heap delta MiB | First-pass RSS delta MiB |
|---|---:|---:|---:|---:|---:|
| baseline | 284.820 [262.391, 323.638] | 13.319 [11.223, 20.313] | 23.678 [23.677, 23.679] | 0.288 [0.269, 0.290] | 2.563 [1.230, 5.355] |
| candidate | 316.834 [260.112, 344.979] | 11.193 [9.982, 12.805] | 23.758 [23.749, 23.762] | 0.314 [0.314, 0.324] | 1.340 [0.223, 3.195] |

## Semantic probe mismatches

- baseline: {"text":" I'ſa","ids":false,"roundTrip":true,"count":false}
- baseline: {"text":"𲨓?t","ids":false,"roundTrip":true,"count":false}

All timed documents and all 32 variants passed exact token IDs, count, and round-trip gates against independent tiktoken in every worker. Semantic probes above are additional non-timed cases; their failures remain disclosed.
