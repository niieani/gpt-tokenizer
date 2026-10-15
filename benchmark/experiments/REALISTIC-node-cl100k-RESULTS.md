# Optimization experiment (publication budget)

Node v26.12.0; cl100k_base; 5 fresh processes per entry. Corpus 2a3a4eb1b0b9fc382f0a616157cae01fb95a74cf727ba7427a8576141fcd0542.

Output consumer: length; length consumes only output length, while full includes a complete output checksum. They are separate metrics.

Speedup is baseline npm latency / entry latency, geometric mean of equally weighted documents within each named category. Each process gives one category ratio; report its median [min, max]. Ranks are category/mode/operation specific; baseline npm is an unranked historical release reference. The 32-request stream is bounded and repeatedly cycled, so it measures changing requests with shared vocabulary, not unlimited unique text. No synthetic-dominated grand mean is used.

| Category | Mode | Operation | Entry | Rank | Speedup vs npm median [min,max] |
|---|---|---|---|---:|---:|
| prose | repeated | encode | candidate | 1 | 1.671× [1.449, 1.786] |
| prose | repeated | encode | baseline | — | 1.000× [1.000, 1.000] |
| prose | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| prose | repeated | decode | candidate | 1 | 0.854× [0.744, 0.860] |
| prose | repeated | count | candidate | 1 | 1.702× [1.448, 1.856] |
| prose | repeated | count | baseline | — | 1.000× [1.000, 1.000] |
| prose | stream | encode | candidate | 1 | 1.652× [1.239, 1.653] |
| prose | stream | encode | baseline | — | 1.000× [1.000, 1.000] |
| prose | stream | decode | baseline | — | 1.000× [1.000, 1.000] |
| prose | stream | decode | candidate | 1 | 0.855× [0.655, 0.890] |
| prose | stream | count | candidate | 1 | 1.633× [1.435, 1.681] |
| prose | stream | count | baseline | — | 1.000× [1.000, 1.000] |
| code | repeated | encode | candidate | 1 | 1.989× [1.732, 2.005] |
| code | repeated | encode | baseline | — | 1.000× [1.000, 1.000] |
| code | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| code | repeated | decode | candidate | 1 | 0.814× [0.778, 0.956] |
| code | repeated | count | candidate | 1 | 2.034× [1.589, 2.108] |
| code | repeated | count | baseline | — | 1.000× [1.000, 1.000] |
| code | stream | encode | candidate | 1 | 1.694× [1.532, 1.814] |
| code | stream | encode | baseline | — | 1.000× [1.000, 1.000] |
| code | stream | decode | baseline | — | 1.000× [1.000, 1.000] |
| code | stream | decode | candidate | 1 | 0.840× [0.710, 0.856] |
| code | stream | count | candidate | 1 | 1.826× [1.729, 1.953] |
| code | stream | count | baseline | — | 1.000× [1.000, 1.000] |
| structured | repeated | encode | candidate | 1 | 2.035× [1.932, 2.186] |
| structured | repeated | encode | baseline | — | 1.000× [1.000, 1.000] |
| structured | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| structured | repeated | decode | candidate | 1 | 0.929× [0.878, 0.938] |
| structured | repeated | count | candidate | 1 | 2.007× [1.989, 2.190] |
| structured | repeated | count | baseline | — | 1.000× [1.000, 1.000] |
| structured | stream | encode | candidate | 1 | 1.915× [1.782, 2.099] |
| structured | stream | encode | baseline | — | 1.000× [1.000, 1.000] |
| structured | stream | decode | baseline | — | 1.000× [1.000, 1.000] |
| structured | stream | decode | candidate | 1 | 0.877× [0.849, 0.903] |
| structured | stream | count | candidate | 1 | 1.978× [1.938, 2.287] |
| structured | stream | count | baseline | — | 1.000× [1.000, 1.000] |
| multilingual | repeated | encode | candidate | 1 | 2.142× [2.009, 2.289] |
| multilingual | repeated | encode | baseline | — | 1.000× [1.000, 1.000] |
| multilingual | repeated | decode | candidate | 1 | 4.337× [4.276, 4.523] |
| multilingual | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| multilingual | repeated | count | candidate | 1 | 2.171× [2.056, 2.375] |
| multilingual | repeated | count | baseline | — | 1.000× [1.000, 1.000] |
| multilingual | stream | encode | candidate | 1 | 2.021× [1.930, 2.049] |
| multilingual | stream | encode | baseline | — | 1.000× [1.000, 1.000] |
| multilingual | stream | decode | candidate | 1 | 5.711× [4.460, 5.958] |
| multilingual | stream | decode | baseline | — | 1.000× [1.000, 1.000] |
| multilingual | stream | count | candidate | 1 | 1.940× [1.927, 2.057] |
| multilingual | stream | count | baseline | — | 1.000× [1.000, 1.000] |
| long-prose | repeated | encode | candidate | 1 | 1.305× [1.173, 1.338] |
| long-prose | repeated | encode | baseline | — | 1.000× [1.000, 1.000] |
| long-prose | repeated | decode | candidate | 1 | 1.150× [1.101, 1.233] |
| long-prose | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| long-prose | repeated | count | candidate | 1 | 1.345× [0.883, 1.432] |
| long-prose | repeated | count | baseline | — | 1.000× [1.000, 1.000] |
| long-prose | stream | encode | candidate | 1 | 1.220× [1.127, 1.399] |
| long-prose | stream | encode | baseline | — | 1.000× [1.000, 1.000] |
| long-prose | stream | decode | candidate | 1 | 1.155× [1.099, 1.234] |
| long-prose | stream | decode | baseline | — | 1.000× [1.000, 1.000] |
| long-prose | stream | count | candidate | 1 | 1.364× [1.232, 1.532] |
| long-prose | stream | count | baseline | — | 1.000× [1.000, 1.000] |
| long-code | repeated | encode | candidate | 1 | 1.458× [1.236, 1.592] |
| long-code | repeated | encode | baseline | — | 1.000× [1.000, 1.000] |
| long-code | repeated | decode | candidate | 1 | 1.060× [0.984, 1.178] |
| long-code | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| long-code | repeated | count | candidate | 1 | 1.354× [1.157, 1.520] |
| long-code | repeated | count | baseline | — | 1.000× [1.000, 1.000] |
| long-code | stream | encode | candidate | 1 | 1.312× [1.117, 1.502] |
| long-code | stream | encode | baseline | — | 1.000× [1.000, 1.000] |
| long-code | stream | decode | baseline | — | 1.000× [1.000, 1.000] |
| long-code | stream | decode | candidate | 1 | 0.975× [0.814, 1.265] |
| long-code | stream | count | candidate | 1 | 1.469× [1.310, 1.763] |
| long-code | stream | count | baseline | — | 1.000× [1.000, 1.000] |
| long-structured | repeated | encode | candidate | 1 | 1.670× [1.392, 2.041] |
| long-structured | repeated | encode | baseline | — | 1.000× [1.000, 1.000] |
| long-structured | repeated | decode | candidate | 1 | 1.026× [0.828, 1.327] |
| long-structured | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| long-structured | repeated | count | candidate | 1 | 1.541× [1.405, 1.652] |
| long-structured | repeated | count | baseline | — | 1.000× [1.000, 1.000] |
| long-structured | stream | encode | candidate | 1 | 1.610× [1.277, 1.687] |
| long-structured | stream | encode | baseline | — | 1.000× [1.000, 1.000] |
| long-structured | stream | decode | candidate | 1 | 1.057× [0.647, 1.113] |
| long-structured | stream | decode | baseline | — | 1.000× [1.000, 1.000] |
| long-structured | stream | count | candidate | 1 | 1.502× [1.387, 2.136] |
| long-structured | stream | count | baseline | — | 1.000× [1.000, 1.000] |

## Per-document latency

Median [min,max] milliseconds across fresh processes. Use these rows to inspect whether a category gain hides a particular regression.

| Document | Mode | Operation | Entry | ms median [min,max] |
|---|---|---|---|---:|
| support | repeated | encode | baseline | 0.009960 [0.009807, 0.012398] |
| support | repeated | encode | candidate | 0.006076 [0.005722, 0.007571] |
| support | repeated | decode | baseline | 0.000437 [0.000411, 0.000475] |
| support | repeated | decode | candidate | 0.000519 [0.000489, 0.000593] |
| support | repeated | count | baseline | 0.010322 [0.009664, 0.012095] |
| support | repeated | count | candidate | 0.006047 [0.005672, 0.007039] |
| support | stream | encode | baseline | 0.011952 [0.011575, 0.015879] |
| support | stream | encode | candidate | 0.007718 [0.007475, 0.009819] |
| support | stream | decode | baseline | 0.000544 [0.000530, 0.000555] |
| support | stream | decode | candidate | 0.000640 [0.000623, 0.000894] |
| support | stream | count | baseline | 0.011997 [0.011447, 0.013051] |
| support | stream | count | candidate | 0.007792 [0.007444, 0.009650] |
| design | repeated | encode | baseline | 0.006498 [0.006243, 0.006741] |
| design | repeated | encode | candidate | 0.004384 [0.004251, 0.005087] |
| design | repeated | decode | baseline | 0.000436 [0.000428, 0.000467] |
| design | repeated | decode | candidate | 0.000511 [0.000503, 0.000650] |
| design | repeated | count | baseline | 0.006355 [0.006120, 0.007796] |
| design | repeated | count | candidate | 0.004206 [0.003903, 0.005863] |
| design | stream | encode | baseline | 0.008500 [0.007877, 0.009111] |
| design | stream | encode | candidate | 0.005562 [0.005354, 0.007203] |
| design | stream | decode | baseline | 0.000549 [0.000533, 0.000616] |
| design | stream | decode | candidate | 0.000690 [0.000656, 0.000773] |
| design | stream | count | baseline | 0.008157 [0.007789, 0.008242] |
| design | stream | count | candidate | 0.005378 [0.005169, 0.006031] |
| release | repeated | encode | baseline | 0.010061 [0.009191, 0.010467] |
| release | repeated | encode | candidate | 0.005193 [0.004625, 0.006303] |
| release | repeated | decode | baseline | 0.000489 [0.000474, 0.000534] |
| release | repeated | decode | candidate | 0.000587 [0.000572, 0.000651] |
| release | repeated | count | baseline | 0.009563 [0.008955, 0.010831] |
| release | repeated | count | candidate | 0.004714 [0.004333, 0.006954] |
| release | stream | encode | baseline | 0.011481 [0.011001, 0.014338] |
| release | stream | encode | candidate | 0.006513 [0.006149, 0.009718] |
| release | stream | decode | baseline | 0.000598 [0.000563, 0.000682] |
| release | stream | decode | candidate | 0.000692 [0.000660, 0.000818] |
| release | stream | count | baseline | 0.010942 [0.010725, 0.011403] |
| release | stream | count | candidate | 0.005911 [0.005578, 0.007000] |
| typescript | repeated | encode | baseline | 0.011585 [0.011357, 0.013972] |
| typescript | repeated | encode | candidate | 0.005834 [0.005738, 0.006788] |
| typescript | repeated | decode | baseline | 0.000569 [0.000557, 0.000758] |
| typescript | repeated | decode | candidate | 0.000691 [0.000652, 0.000841] |
| typescript | repeated | count | baseline | 0.011993 [0.011364, 0.013106] |
| typescript | repeated | count | candidate | 0.005662 [0.005495, 0.009039] |
| typescript | stream | encode | baseline | 0.013620 [0.012599, 0.014903] |
| typescript | stream | encode | candidate | 0.007251 [0.006749, 0.008351] |
| typescript | stream | decode | baseline | 0.000708 [0.000675, 0.000790] |
| typescript | stream | decode | candidate | 0.000851 [0.000794, 0.001026] |
| typescript | stream | count | baseline | 0.012925 [0.012704, 0.014314] |
| typescript | stream | count | candidate | 0.006686 [0.006511, 0.008271] |
| python | repeated | encode | baseline | 0.009297 [0.009073, 0.009723] |
| python | repeated | encode | candidate | 0.005515 [0.004692, 0.006184] |
| python | repeated | decode | baseline | 0.000473 [0.000442, 0.000498] |
| python | repeated | decode | candidate | 0.000586 [0.000548, 0.000661] |
| python | repeated | count | baseline | 0.009640 [0.008709, 0.010120] |
| python | repeated | count | candidate | 0.005028 [0.004768, 0.006054] |
| python | stream | encode | baseline | 0.010929 [0.010487, 0.011877] |
| python | stream | encode | candidate | 0.006767 [0.006424, 0.008272] |
| python | stream | decode | baseline | 0.000585 [0.000562, 0.000693] |
| python | stream | decode | candidate | 0.000730 [0.000693, 0.000910] |
| python | stream | count | baseline | 0.010426 [0.010080, 0.010867] |
| python | stream | count | candidate | 0.005908 [0.005858, 0.006927] |
| sql | repeated | encode | baseline | 0.008606 [0.008275, 0.009335] |
| sql | repeated | encode | candidate | 0.004234 [0.004003, 0.004423] |
| sql | repeated | decode | baseline | 0.000473 [0.000426, 0.000640] |
| sql | repeated | decode | candidate | 0.000560 [0.000529, 0.000637] |
| sql | repeated | count | baseline | 0.008313 [0.008185, 0.009642] |
| sql | repeated | count | candidate | 0.004077 [0.003892, 0.004356] |
| sql | stream | encode | baseline | 0.010089 [0.008975, 0.010703] |
| sql | stream | encode | candidate | 0.005483 [0.005270, 0.006486] |
| sql | stream | decode | baseline | 0.000574 [0.000558, 0.000599] |
| sql | stream | decode | candidate | 0.000676 [0.000658, 0.000831] |
| sql | stream | count | baseline | 0.009431 [0.009055, 0.009987] |
| sql | stream | count | candidate | 0.005182 [0.004818, 0.005558] |
| api-json | repeated | encode | baseline | 0.009498 [0.009002, 0.010596] |
| api-json | repeated | encode | candidate | 0.004865 [0.004394, 0.005294] |
| api-json | repeated | decode | baseline | 0.000513 [0.000477, 0.000581] |
| api-json | repeated | decode | candidate | 0.000580 [0.000553, 0.000614] |
| api-json | repeated | count | baseline | 0.009098 [0.008646, 0.010087] |
| api-json | repeated | count | candidate | 0.004454 [0.004161, 0.004645] |
| api-json | stream | encode | baseline | 0.010739 [0.010494, 0.011232] |
| api-json | stream | encode | candidate | 0.005925 [0.005734, 0.006282] |
| api-json | stream | decode | baseline | 0.000620 [0.000613, 0.000715] |
| api-json | stream | decode | candidate | 0.000748 [0.000709, 0.000890] |
| api-json | stream | count | baseline | 0.010345 [0.009974, 0.013989] |
| api-json | stream | count | candidate | 0.005286 [0.005210, 0.005547] |
| chat-json | repeated | encode | baseline | 0.010472 [0.009711, 0.013231] |
| chat-json | repeated | encode | candidate | 0.005523 [0.005413, 0.005747] |
| chat-json | repeated | decode | baseline | 0.000570 [0.000523, 0.000762] |
| chat-json | repeated | decode | candidate | 0.000645 [0.000633, 0.000657] |
| chat-json | repeated | count | baseline | 0.010461 [0.010036, 0.011133] |
| chat-json | repeated | count | candidate | 0.005189 [0.004825, 0.005965] |
| chat-json | stream | encode | baseline | 0.011953 [0.011512, 0.014840] |
| chat-json | stream | encode | candidate | 0.006659 [0.006316, 0.008366] |
| chat-json | stream | decode | baseline | 0.000685 [0.000676, 0.000734] |
| chat-json | stream | decode | candidate | 0.000806 [0.000771, 0.000825] |
| chat-json | stream | count | baseline | 0.012304 [0.011860, 0.013520] |
| chat-json | stream | count | candidate | 0.006255 [0.006034, 0.006921] |
| logs | repeated | encode | baseline | 0.012524 [0.011890, 0.014665] |
| logs | repeated | encode | candidate | 0.005811 [0.005549, 0.006169] |
| logs | repeated | decode | baseline | 0.000783 [0.000758, 0.001045] |
| logs | repeated | decode | candidate | 0.000883 [0.000865, 0.001007] |
| logs | repeated | count | baseline | 0.011609 [0.011268, 0.012514] |
| logs | repeated | count | candidate | 0.005475 [0.004940, 0.007107] |
| logs | stream | encode | baseline | 0.014047 [0.013839, 0.015509] |
| logs | stream | encode | candidate | 0.006731 [0.006388, 0.006769] |
| logs | stream | decode | baseline | 0.000932 [0.000915, 0.001062] |
| logs | stream | decode | candidate | 0.001012 [0.000952, 0.001102] |
| logs | stream | count | baseline | 0.013580 [0.012769, 0.013787] |
| logs | stream | count | candidate | 0.006237 [0.006039, 0.006738] |
| cjk | repeated | encode | baseline | 0.008237 [0.007531, 0.008625] |
| cjk | repeated | encode | candidate | 0.003689 [0.003491, 0.003780] |
| cjk | repeated | decode | baseline | 0.025798 [0.024276, 0.030324] |
| cjk | repeated | decode | candidate | 0.006696 [0.006184, 0.007521] |
| cjk | repeated | count | baseline | 0.007477 [0.007066, 0.007545] |
| cjk | repeated | count | candidate | 0.003286 [0.003170, 0.003399] |
| cjk | stream | encode | baseline | 0.010391 [0.010354, 0.011093] |
| cjk | stream | encode | candidate | 0.005271 [0.005166, 0.005655] |
| cjk | stream | decode | baseline | 0.024168 [0.022291, 0.024756] |
| cjk | stream | decode | candidate | 0.002799 [0.002620, 0.003940] |
| cjk | stream | count | baseline | 0.009816 [0.009472, 0.010754] |
| cjk | stream | count | candidate | 0.004996 [0.004619, 0.006020] |
| european | repeated | encode | baseline | 0.013862 [0.013131, 0.018227] |
| european | repeated | encode | candidate | 0.007004 [0.006946, 0.007515] |
| european | repeated | decode | baseline | 0.001919 [0.001834, 0.002052] |
| european | repeated | decode | candidate | 0.001091 [0.001061, 0.001127] |
| european | repeated | count | baseline | 0.012730 [0.012585, 0.019141] |
| european | repeated | count | candidate | 0.006660 [0.006425, 0.006947] |
| european | stream | encode | baseline | 0.017338 [0.016578, 0.020169] |
| european | stream | encode | candidate | 0.008817 [0.008370, 0.009143] |
| european | stream | decode | baseline | 0.002166 [0.002026, 0.002527] |
| european | stream | decode | candidate | 0.001248 [0.001213, 0.001411] |
| european | stream | count | baseline | 0.015490 [0.015080, 0.019070] |
| european | stream | count | candidate | 0.008828 [0.008190, 0.009552] |
| mixed | repeated | encode | baseline | 0.018849 [0.018192, 0.019596] |
| mixed | repeated | encode | candidate | 0.008845 [0.008699, 0.009440] |
| mixed | repeated | decode | baseline | 0.038123 [0.034991, 0.039068] |
| mixed | repeated | decode | candidate | 0.003210 [0.002922, 0.003402] |
| mixed | repeated | count | baseline | 0.017866 [0.016239, 0.020856] |
| mixed | repeated | count | candidate | 0.008497 [0.007846, 0.008638] |
| mixed | stream | encode | baseline | 0.021286 [0.020940, 0.023135] |
| mixed | stream | encode | candidate | 0.010810 [0.010400, 0.011141] |
| mixed | stream | decode | baseline | 0.039674 [0.038294, 0.043663] |
| mixed | stream | decode | candidate | 0.003379 [0.003157, 0.003879] |
| mixed | stream | count | baseline | 0.020625 [0.019438, 0.023027] |
| mixed | stream | count | candidate | 0.009762 [0.009331, 0.010486] |
| readme.md | repeated | encode | baseline | 0.894798 [0.879962, 0.930741] |
| readme.md | repeated | encode | candidate | 0.690007 [0.669637, 0.777084] |
| readme.md | repeated | decode | baseline | 0.037287 [0.036177, 0.039630] |
| readme.md | repeated | decode | candidate | 0.032151 [0.031553, 0.033450] |
| readme.md | repeated | count | baseline | 0.885014 [0.853385, 0.904455] |
| readme.md | repeated | count | candidate | 0.643207 [0.631528, 1.024668] |
| readme.md | stream | encode | baseline | 0.883827 [0.823353, 0.958516] |
| readme.md | stream | encode | candidate | 0.702079 [0.674725, 0.784463] |
| readme.md | stream | decode | baseline | 0.038322 [0.036466, 0.040714] |
| readme.md | stream | decode | candidate | 0.033269 [0.030540, 0.034131] |
| readme.md | stream | count | baseline | 0.907787 [0.805461, 1.019804] |
| readme.md | stream | count | candidate | 0.665435 [0.647742, 0.700171] |
| encoding.ts | repeated | encode | baseline | 0.707709 [0.667681, 0.769481] |
| encoding.ts | repeated | encode | candidate | 0.490556 [0.457874, 0.559277] |
| encoding.ts | repeated | decode | baseline | 0.035877 [0.034300, 0.038039] |
| encoding.ts | repeated | decode | candidate | 0.032373 [0.031202, 0.036476] |
| encoding.ts | repeated | count | baseline | 0.611123 [0.593646, 0.660208] |
| encoding.ts | repeated | count | candidate | 0.447481 [0.402123, 0.533409] |
| encoding.ts | stream | encode | baseline | 0.662243 [0.626333, 0.692187] |
| encoding.ts | stream | encode | candidate | 0.502315 [0.460885, 0.560761] |
| encoding.ts | stream | decode | baseline | 0.035677 [0.035003, 0.042829] |
| encoding.ts | stream | decode | candidate | 0.036486 [0.033198, 0.043804] |
| encoding.ts | stream | count | baseline | 0.641164 [0.612637, 0.748068] |
| encoding.ts | stream | count | candidate | 0.434931 [0.422705, 0.489292] |
| packages.json | repeated | encode | baseline | 0.210241 [0.194397, 0.252249] |
| packages.json | repeated | encode | candidate | 0.128361 [0.123581, 0.139621] |
| packages.json | repeated | decode | baseline | 0.012604 [0.012264, 0.016356] |
| packages.json | repeated | decode | candidate | 0.012330 [0.011489, 0.014805] |
| packages.json | repeated | count | baseline | 0.191855 [0.185418, 0.195218] |
| packages.json | repeated | count | candidate | 0.125779 [0.116150, 0.136511] |
| packages.json | stream | encode | baseline | 0.210239 [0.203987, 0.220879] |
| packages.json | stream | encode | candidate | 0.130934 [0.123100, 0.164644] |
| packages.json | stream | decode | baseline | 0.012967 [0.012581, 0.014549] |
| packages.json | stream | decode | candidate | 0.013074 [0.011676, 0.020864] |
| packages.json | stream | count | baseline | 0.194768 [0.191325, 0.314307] |
| packages.json | stream | count | candidate | 0.129092 [0.115895, 0.147128] |

## First-use and retained memory (unranked)

One complete document pass per fresh process before correctness/warmup. Document order is fixed, so individual first-use timings are order dependent. Initialization excludes engine startup and includes module import/factory. Heap/RSS deltas follow two event-loop turns and full GC. These are diagnostics; use the separate settled memory suite for publication.

| Entry | Initialization ms [min,max] | First-pass encode total ms [min,max] | Init heap delta MiB | First-pass heap delta MiB | First-pass RSS delta MiB |
|---|---:|---:|---:|---:|---:|
| baseline | 53.236 [51.110, 79.601] | 29.904 [25.022, 39.196] | 8.138 [7.737, 8.141] | 0.498 [0.495, 0.499] | 18.500 [18.125, 18.750] |
| candidate | 56.713 [54.315, 64.868] | 18.802 [16.380, 24.153] | 8.254 [8.254, 8.259] | 0.500 [0.493, 0.505] | 6.375 [5.000, 7.625] |

## Semantic probe mismatches

- baseline: {"text":"𲨓?t","ids":false,"roundTrip":true,"count":false}

All timed documents and all 32 variants passed exact token IDs, count, and round-trip gates against independent tiktoken in every worker. Semantic probes above are additional non-timed cases; their failures remain disclosed.
