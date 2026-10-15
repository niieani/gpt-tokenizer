# Optimization experiment (publication budget)

Node v26.12.0; o200k_base; 5 fresh processes per entry. Corpus 2a3a4eb1b0b9fc382f0a616157cae01fb95a74cf727ba7427a8576141fcd0542.

Output consumer: length; length consumes only output length, while full includes a complete output checksum. They are separate metrics.

Speedup is baseline npm latency / entry latency, geometric mean of equally weighted documents within each named category. Each process gives one category ratio; report its median [min, max]. Ranks are category/mode/operation specific; baseline npm is an unranked historical release reference. The 32-request stream is bounded and repeatedly cycled, so it measures changing requests with shared vocabulary, not unlimited unique text. No synthetic-dominated grand mean is used.

| Category | Mode | Operation | Entry | Rank | Speedup vs npm median [min,max] |
|---|---|---|---|---:|---:|
| prose | repeated | encode | @goliapkg/tiktoken-wasm | 1 | 2.674× [2.635, 3.040] |
| prose | repeated | encode | candidate | 2 | 1.611× [1.526, 1.675] |
| prose | repeated | encode | bpe-lite | 3 | 1.365× [1.232, 1.448] |
| prose | repeated | encode | ai-tokenizer | 4 | 1.162× [1.038, 1.174] |
| prose | repeated | encode | baseline | — | 1.000× [1.000, 1.000] |
| prose | repeated | encode | tiktoken | 5 | 0.104× [0.102, 0.111] |
| prose | repeated | decode | ai-tokenizer | 1 | 1.059× [1.000, 1.125] |
| prose | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| prose | repeated | decode | candidate | 2 | 0.852× [0.840, 0.882] |
| prose | repeated | decode | @goliapkg/tiktoken-wasm | 3 | 0.407× [0.386, 0.424] |
| prose | repeated | decode | bpe-lite | 4 | 0.243× [0.230, 0.263] |
| prose | repeated | decode | tiktoken | 5 | 0.206× [0.192, 0.210] |
| prose | repeated | count | @goliapkg/tiktoken-wasm | 1 | 5.162× [4.922, 5.785] |
| prose | repeated | count | candidate | 2 | 1.660× [1.643, 1.838] |
| prose | repeated | count | bpe-lite | 3 | 1.362× [1.266, 1.519] |
| prose | repeated | count | ai-tokenizer | 4 | 1.110× [1.079, 1.333] |
| prose | repeated | count | baseline | — | 1.000× [1.000, 1.000] |
| prose | repeated | count | tiktoken | 5 | 0.104× [0.097, 0.115] |
| prose | stream | encode | @goliapkg/tiktoken-wasm | 1 | 3.061× [2.954, 3.223] |
| prose | stream | encode | candidate | 2 | 1.563× [1.488, 1.640] |
| prose | stream | encode | bpe-lite | 3 | 1.310× [1.199, 1.480] |
| prose | stream | encode | ai-tokenizer | 4 | 1.207× [1.121, 1.301] |
| prose | stream | encode | baseline | — | 1.000× [1.000, 1.000] |
| prose | stream | encode | tiktoken | 5 | 0.121× [0.114, 0.129] |
| prose | stream | decode | ai-tokenizer | 1 | 1.084× [0.994, 1.249] |
| prose | stream | decode | baseline | — | 1.000× [1.000, 1.000] |
| prose | stream | decode | candidate | 2 | 0.850× [0.756, 0.917] |
| prose | stream | decode | @goliapkg/tiktoken-wasm | 3 | 0.445× [0.412, 0.458] |
| prose | stream | decode | bpe-lite | 4 | 0.252× [0.237, 0.278] |
| prose | stream | decode | tiktoken | 5 | 0.231× [0.221, 0.248] |
| prose | stream | count | @goliapkg/tiktoken-wasm | 1 | 5.561× [5.519, 6.512] |
| prose | stream | count | candidate | 2 | 1.574× [1.533, 1.761] |
| prose | stream | count | bpe-lite | 3 | 1.309× [1.195, 1.455] |
| prose | stream | count | ai-tokenizer | 4 | 1.149× [1.045, 1.349] |
| prose | stream | count | baseline | — | 1.000× [1.000, 1.000] |
| prose | stream | count | tiktoken | 5 | 0.116× [0.112, 0.128] |
| code | repeated | encode | @goliapkg/tiktoken-wasm | 1 | 2.527× [2.395, 2.765] |
| code | repeated | encode | candidate | 2 | 1.637× [1.585, 1.767] |
| code | repeated | encode | bpe-lite | 3 | 1.283× [1.254, 1.352] |
| code | repeated | encode | ai-tokenizer | 4 | 1.130× [1.089, 1.247] |
| code | repeated | encode | baseline | — | 1.000× [1.000, 1.000] |
| code | repeated | encode | tiktoken | 5 | 0.094× [0.090, 0.100] |
| code | repeated | decode | ai-tokenizer | 1 | 1.074× [1.028, 1.294] |
| code | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| code | repeated | decode | candidate | 2 | 0.840× [0.836, 0.937] |
| code | repeated | decode | @goliapkg/tiktoken-wasm | 3 | 0.457× [0.425, 0.530] |
| code | repeated | decode | bpe-lite | 4 | 0.256× [0.240, 0.294] |
| code | repeated | decode | tiktoken | 5 | 0.227× [0.213, 0.250] |
| code | repeated | count | @goliapkg/tiktoken-wasm | 1 | 4.720× [3.880, 6.598] |
| code | repeated | count | candidate | 2 | 1.710× [1.670, 2.330] |
| code | repeated | count | bpe-lite | 3 | 1.315× [1.280, 1.822] |
| code | repeated | count | ai-tokenizer | 4 | 1.142× [1.079, 1.601] |
| code | repeated | count | baseline | — | 1.000× [1.000, 1.000] |
| code | repeated | count | tiktoken | 5 | 0.095× [0.095, 0.122] |
| code | stream | encode | @goliapkg/tiktoken-wasm | 1 | 2.958× [2.294, 3.751] |
| code | stream | encode | candidate | 2 | 1.651× [1.580, 1.987] |
| code | stream | encode | bpe-lite | 3 | 1.363× [1.271, 1.849] |
| code | stream | encode | ai-tokenizer | 4 | 1.254× [1.184, 1.759] |
| code | stream | encode | baseline | — | 1.000× [1.000, 1.000] |
| code | stream | encode | tiktoken | 5 | 0.111× [0.105, 0.151] |
| code | stream | decode | ai-tokenizer | 1 | 1.138× [1.034, 1.297] |
| code | stream | decode | baseline | — | 1.000× [1.000, 1.000] |
| code | stream | decode | candidate | 2 | 0.888× [0.803, 0.962] |
| code | stream | decode | @goliapkg/tiktoken-wasm | 3 | 0.536× [0.430, 0.589] |
| code | stream | decode | tiktoken | 4 | 0.275× [0.249, 0.306] |
| code | stream | decode | bpe-lite | 5 | 0.259× [0.249, 0.331] |
| code | stream | count | @goliapkg/tiktoken-wasm | 1 | 5.067× [4.653, 5.922] |
| code | stream | count | candidate | 2 | 1.736× [1.462, 1.878] |
| code | stream | count | bpe-lite | 3 | 1.405× [1.255, 1.608] |
| code | stream | count | ai-tokenizer | 4 | 1.217× [1.119, 1.464] |
| code | stream | count | baseline | — | 1.000× [1.000, 1.000] |
| code | stream | count | tiktoken | 5 | 0.106× [0.096, 0.119] |
| structured | repeated | encode | @goliapkg/tiktoken-wasm | 1 | 3.068× [2.967, 3.326] |
| structured | repeated | encode | candidate | 2 | 1.784× [1.613, 1.939] |
| structured | repeated | encode | bpe-lite | 3 | 1.390× [1.300, 1.520] |
| structured | repeated | encode | ai-tokenizer | 4 | 1.286× [1.241, 1.315] |
| structured | repeated | encode | baseline | — | 1.000× [1.000, 1.000] |
| structured | repeated | encode | tiktoken | 5 | 0.110× [0.103, 0.117] |
| structured | repeated | decode | ai-tokenizer | 1 | 1.062× [0.995, 1.112] |
| structured | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| structured | repeated | decode | candidate | 2 | 0.808× [0.660, 0.867] |
| structured | repeated | decode | @goliapkg/tiktoken-wasm | 3 | 0.515× [0.511, 0.530] |
| structured | repeated | decode | tiktoken | 4 | 0.261× [0.231, 0.282] |
| structured | repeated | decode | bpe-lite | 5 | 0.253× [0.246, 0.279] |
| structured | repeated | count | @goliapkg/tiktoken-wasm | 1 | 5.642× [5.619, 6.528] |
| structured | repeated | count | candidate | 2 | 1.838× [1.774, 1.911] |
| structured | repeated | count | bpe-lite | 3 | 1.456× [1.374, 1.688] |
| structured | repeated | count | ai-tokenizer | 4 | 1.240× [1.168, 1.389] |
| structured | repeated | count | baseline | — | 1.000× [1.000, 1.000] |
| structured | repeated | count | tiktoken | 5 | 0.109× [0.102, 0.119] |
| structured | stream | encode | @goliapkg/tiktoken-wasm | 1 | 3.106× [2.609, 3.215] |
| structured | stream | encode | candidate | 2 | 1.694× [1.627, 1.718] |
| structured | stream | encode | bpe-lite | 3 | 1.336× [1.300, 1.492] |
| structured | stream | encode | ai-tokenizer | 4 | 1.285× [1.250, 1.342] |
| structured | stream | encode | baseline | — | 1.000× [1.000, 1.000] |
| structured | stream | encode | tiktoken | 5 | 0.114× [0.112, 0.117] |
| structured | stream | decode | ai-tokenizer | 1 | 1.124× [1.049, 1.241] |
| structured | stream | decode | baseline | — | 1.000× [1.000, 1.000] |
| structured | stream | decode | candidate | 2 | 0.849× [0.786, 0.908] |
| structured | stream | decode | @goliapkg/tiktoken-wasm | 3 | 0.548× [0.463, 0.575] |
| structured | stream | decode | tiktoken | 4 | 0.303× [0.285, 0.317] |
| structured | stream | decode | bpe-lite | 5 | 0.278× [0.248, 0.310] |
| structured | stream | count | @goliapkg/tiktoken-wasm | 1 | 5.945× [5.761, 6.166] |
| structured | stream | count | candidate | 2 | 1.759× [1.725, 1.985] |
| structured | stream | count | bpe-lite | 3 | 1.435× [1.402, 1.626] |
| structured | stream | count | ai-tokenizer | 4 | 1.284× [1.244, 1.414] |
| structured | stream | count | baseline | — | 1.000× [1.000, 1.000] |
| structured | stream | count | tiktoken | 5 | 0.114× [0.107, 0.119] |
| multilingual | repeated | encode | @goliapkg/tiktoken-wasm | 1 | 2.131× [2.059, 2.200] |
| multilingual | repeated | encode | candidate | 2 | 1.668× [1.611, 1.718] |
| multilingual | repeated | encode | bpe-lite | 3 | 1.452× [1.369, 1.559] |
| multilingual | repeated | encode | ai-tokenizer | 4 | 1.321× [1.292, 1.429] |
| multilingual | repeated | encode | baseline | — | 1.000× [1.000, 1.000] |
| multilingual | repeated | encode | tiktoken | 5 | 0.135× [0.120, 0.136] |
| multilingual | repeated | decode | candidate | 1 | 1.048× [1.025, 1.066] |
| multilingual | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| multilingual | repeated | decode | ai-tokenizer | 2 | 0.969× [0.907, 1.092] |
| multilingual | repeated | decode | @goliapkg/tiktoken-wasm | 3 | 0.870× [0.854, 0.890] |
| multilingual | repeated | decode | tiktoken | 4 | 0.589× [0.508, 0.608] |
| multilingual | repeated | decode | bpe-lite | 5 | 0.517× [0.452, 0.615] |
| multilingual | repeated | count | @goliapkg/tiktoken-wasm | 1 | 2.570× [2.539, 2.645] |
| multilingual | repeated | count | candidate | 2 | 1.692× [1.547, 1.710] |
| multilingual | repeated | count | bpe-lite | 3 | 1.435× [1.349, 1.571] |
| multilingual | repeated | count | ai-tokenizer | 4 | 1.238× [1.182, 1.379] |
| multilingual | repeated | count | baseline | — | 1.000× [1.000, 1.000] |
| multilingual | repeated | count | tiktoken | 5 | 0.125× [0.123, 0.128] |
| multilingual | stream | encode | @goliapkg/tiktoken-wasm | 1 | 2.483× [2.389, 2.530] |
| multilingual | stream | encode | candidate | 2 | 1.582× [1.509, 1.621] |
| multilingual | stream | encode | bpe-lite | 3 | 1.374× [1.246, 1.490] |
| multilingual | stream | encode | ai-tokenizer | 4 | 1.287× [1.265, 1.413] |
| multilingual | stream | encode | baseline | — | 1.000× [1.000, 1.000] |
| multilingual | stream | encode | tiktoken | 5 | 0.151× [0.140, 0.157] |
| multilingual | stream | decode | candidate | 1 | 1.090× [1.049, 1.133] |
| multilingual | stream | decode | baseline | — | 1.000× [1.000, 1.000] |
| multilingual | stream | decode | ai-tokenizer | 2 | 0.957× [0.886, 1.075] |
| multilingual | stream | decode | @goliapkg/tiktoken-wasm | 3 | 0.909× [0.868, 0.959] |
| multilingual | stream | decode | tiktoken | 4 | 0.615× [0.572, 0.639] |
| multilingual | stream | decode | bpe-lite | 5 | 0.508× [0.476, 0.541] |
| multilingual | stream | count | @goliapkg/tiktoken-wasm | 1 | 3.091× [3.061, 3.163] |
| multilingual | stream | count | candidate | 2 | 1.591× [1.555, 1.681] |
| multilingual | stream | count | bpe-lite | 3 | 1.362× [1.307, 1.486] |
| multilingual | stream | count | ai-tokenizer | 4 | 1.261× [1.246, 1.376] |
| multilingual | stream | count | baseline | — | 1.000× [1.000, 1.000] |
| multilingual | stream | count | tiktoken | 5 | 0.146× [0.141, 0.148] |
| long-prose | repeated | encode | @goliapkg/tiktoken-wasm | 1 | 6.936× [6.672, 7.561] |
| long-prose | repeated | encode | ai-tokenizer | 2 | 1.377× [1.239, 1.460] |
| long-prose | repeated | encode | candidate | 3 | 1.267× [1.190, 1.325] |
| long-prose | repeated | encode | bpe-lite | 4 | 1.221× [0.988, 1.394] |
| long-prose | repeated | encode | baseline | — | 1.000× [1.000, 1.000] |
| long-prose | repeated | encode | tiktoken | 5 | 0.351× [0.309, 0.376] |
| long-prose | repeated | decode | candidate | 1 | 1.107× [1.028, 1.335] |
| long-prose | repeated | decode | ai-tokenizer | 2 | 1.037× [0.974, 1.205] |
| long-prose | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| long-prose | repeated | decode | @goliapkg/tiktoken-wasm | 3 | 0.591× [0.569, 0.744] |
| long-prose | repeated | decode | tiktoken | 4 | 0.385× [0.351, 0.423] |
| long-prose | repeated | decode | bpe-lite | 5 | 0.218× [0.181, 0.284] |
| long-prose | repeated | count | @goliapkg/tiktoken-wasm | 1 | 11.008× [10.593, 12.286] |
| long-prose | repeated | count | ai-tokenizer | 2 | 1.281× [1.203, 1.415] |
| long-prose | repeated | count | bpe-lite | 3 | 1.276× [1.067, 1.516] |
| long-prose | repeated | count | candidate | 4 | 1.224× [1.142, 1.396] |
| long-prose | repeated | count | baseline | — | 1.000× [1.000, 1.000] |
| long-prose | repeated | count | tiktoken | 5 | 0.323× [0.315, 0.339] |
| long-prose | stream | encode | @goliapkg/tiktoken-wasm | 1 | 6.645× [6.318, 6.859] |
| long-prose | stream | encode | ai-tokenizer | 2 | 1.317× [1.233, 1.648] |
| long-prose | stream | encode | bpe-lite | 3 | 1.243× [1.020, 1.562] |
| long-prose | stream | encode | candidate | 4 | 1.199× [1.080, 1.447] |
| long-prose | stream | encode | baseline | — | 1.000× [1.000, 1.000] |
| long-prose | stream | encode | tiktoken | 5 | 0.330× [0.314, 0.380] |
| long-prose | stream | decode | candidate | 1 | 1.171× [1.076, 1.248] |
| long-prose | stream | decode | ai-tokenizer | 2 | 1.103× [0.976, 1.194] |
| long-prose | stream | decode | baseline | — | 1.000× [1.000, 1.000] |
| long-prose | stream | decode | @goliapkg/tiktoken-wasm | 3 | 0.610× [0.575, 0.650] |
| long-prose | stream | decode | tiktoken | 4 | 0.394× [0.379, 0.422] |
| long-prose | stream | decode | bpe-lite | 5 | 0.235× [0.197, 0.255] |
| long-prose | stream | count | @goliapkg/tiktoken-wasm | 1 | 10.928× [9.742, 11.089] |
| long-prose | stream | count | ai-tokenizer | 2 | 1.274× [1.212, 1.281] |
| long-prose | stream | count | candidate | 3 | 1.257× [1.171, 1.315] |
| long-prose | stream | count | bpe-lite | 4 | 1.184× [1.054, 1.366] |
| long-prose | stream | count | baseline | — | 1.000× [1.000, 1.000] |
| long-prose | stream | count | tiktoken | 5 | 0.315× [0.282, 0.329] |
| long-code | repeated | encode | @goliapkg/tiktoken-wasm | 1 | 3.257× [3.050, 3.631] |
| long-code | repeated | encode | ai-tokenizer | 2 | 1.382× [1.299, 1.588] |
| long-code | repeated | encode | candidate | 3 | 1.268× [1.163, 1.515] |
| long-code | repeated | encode | bpe-lite | 4 | 1.234× [1.220, 1.544] |
| long-code | repeated | encode | baseline | — | 1.000× [1.000, 1.000] |
| long-code | repeated | encode | tiktoken | 5 | 0.188× [0.183, 0.222] |
| long-code | repeated | decode | ai-tokenizer | 1 | 1.117× [1.072, 1.165] |
| long-code | repeated | decode | candidate | 2 | 1.069× [1.037, 1.113] |
| long-code | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| long-code | repeated | decode | @goliapkg/tiktoken-wasm | 3 | 0.605× [0.585, 0.622] |
| long-code | repeated | decode | tiktoken | 4 | 0.416× [0.394, 0.433] |
| long-code | repeated | decode | bpe-lite | 5 | 0.229× [0.204, 0.240] |
| long-code | repeated | count | @goliapkg/tiktoken-wasm | 1 | 4.338× [4.051, 4.425] |
| long-code | repeated | count | candidate | 2 | 1.326× [1.280, 1.392] |
| long-code | repeated | count | ai-tokenizer | 3 | 1.297× [1.237, 1.540] |
| long-code | repeated | count | bpe-lite | 4 | 1.281× [1.131, 1.516] |
| long-code | repeated | count | baseline | — | 1.000× [1.000, 1.000] |
| long-code | repeated | count | tiktoken | 5 | 0.183× [0.162, 0.187] |
| long-code | stream | encode | @goliapkg/tiktoken-wasm | 1 | 3.151× [2.147, 3.721] |
| long-code | stream | encode | ai-tokenizer | 2 | 1.315× [1.255, 1.726] |
| long-code | stream | encode | bpe-lite | 3 | 1.265× [1.137, 1.509] |
| long-code | stream | encode | candidate | 4 | 1.233× [1.172, 1.401] |
| long-code | stream | encode | baseline | — | 1.000× [1.000, 1.000] |
| long-code | stream | encode | tiktoken | 5 | 0.188× [0.163, 0.204] |
| long-code | stream | decode | candidate | 1 | 1.048× [1.015, 1.180] |
| long-code | stream | decode | baseline | — | 1.000× [1.000, 1.000] |
| long-code | stream | decode | ai-tokenizer | 2 | 0.989× [0.910, 1.142] |
| long-code | stream | decode | @goliapkg/tiktoken-wasm | 3 | 0.578× [0.356, 0.640] |
| long-code | stream | decode | tiktoken | 4 | 0.425× [0.362, 0.431] |
| long-code | stream | decode | bpe-lite | 5 | 0.220× [0.190, 0.243] |
| long-code | stream | count | @goliapkg/tiktoken-wasm | 1 | 4.223× [3.053, 4.327] |
| long-code | stream | count | ai-tokenizer | 2 | 1.257× [1.222, 1.356] |
| long-code | stream | count | bpe-lite | 3 | 1.250× [0.798, 1.331] |
| long-code | stream | count | candidate | 4 | 1.242× [1.233, 1.286] |
| long-code | stream | count | baseline | — | 1.000× [1.000, 1.000] |
| long-code | stream | count | tiktoken | 5 | 0.182× [0.172, 0.193] |
| long-structured | repeated | encode | @goliapkg/tiktoken-wasm | 1 | 3.171× [2.932, 3.607] |
| long-structured | repeated | encode | candidate | 2 | 1.570× [1.456, 1.749] |
| long-structured | repeated | encode | ai-tokenizer | 3 | 1.488× [1.259, 1.595] |
| long-structured | repeated | encode | bpe-lite | 4 | 1.268× [0.823, 1.596] |
| long-structured | repeated | encode | baseline | — | 1.000× [1.000, 1.000] |
| long-structured | repeated | encode | tiktoken | 5 | 0.179× [0.156, 0.194] |
| long-structured | repeated | decode | candidate | 1 | 1.063× [0.970, 1.165] |
| long-structured | repeated | decode | ai-tokenizer | 2 | 1.061× [1.026, 1.160] |
| long-structured | repeated | decode | baseline | — | 1.000× [1.000, 1.000] |
| long-structured | repeated | decode | @goliapkg/tiktoken-wasm | 3 | 0.715× [0.669, 0.745] |
| long-structured | repeated | decode | tiktoken | 4 | 0.550× [0.507, 0.584] |
| long-structured | repeated | decode | bpe-lite | 5 | 0.245× [0.209, 0.286] |
| long-structured | repeated | count | @goliapkg/tiktoken-wasm | 1 | 3.979× [3.810, 4.104] |
| long-structured | repeated | count | candidate | 2 | 1.478× [1.364, 1.502] |
| long-structured | repeated | count | bpe-lite | 3 | 1.267× [1.182, 1.405] |
| long-structured | repeated | count | ai-tokenizer | 4 | 1.249× [1.220, 1.395] |
| long-structured | repeated | count | baseline | — | 1.000× [1.000, 1.000] |
| long-structured | repeated | count | tiktoken | 5 | 0.163× [0.152, 0.178] |
| long-structured | stream | encode | @goliapkg/tiktoken-wasm | 1 | 3.243× [3.046, 3.342] |
| long-structured | stream | encode | candidate | 2 | 1.457× [1.242, 1.717] |
| long-structured | stream | encode | ai-tokenizer | 3 | 1.368× [1.182, 1.562] |
| long-structured | stream | encode | bpe-lite | 4 | 1.243× [1.180, 1.660] |
| long-structured | stream | encode | baseline | — | 1.000× [1.000, 1.000] |
| long-structured | stream | encode | tiktoken | 5 | 0.177× [0.158, 0.208] |
| long-structured | stream | decode | ai-tokenizer | 1 | 1.059× [1.014, 1.164] |
| long-structured | stream | decode | candidate | 2 | 1.056× [0.969, 1.137] |
| long-structured | stream | decode | baseline | — | 1.000× [1.000, 1.000] |
| long-structured | stream | decode | @goliapkg/tiktoken-wasm | 3 | 0.702× [0.513, 0.718] |
| long-structured | stream | decode | tiktoken | 4 | 0.521× [0.515, 0.566] |
| long-structured | stream | decode | bpe-lite | 5 | 0.248× [0.237, 0.263] |
| long-structured | stream | count | @goliapkg/tiktoken-wasm | 1 | 4.174× [2.406, 4.201] |
| long-structured | stream | count | candidate | 2 | 1.494× [1.409, 1.569] |
| long-structured | stream | count | bpe-lite | 3 | 1.293× [1.215, 1.459] |
| long-structured | stream | count | ai-tokenizer | 4 | 1.206× [0.776, 1.387] |
| long-structured | stream | count | baseline | — | 1.000× [1.000, 1.000] |
| long-structured | stream | count | tiktoken | 5 | 0.162× [0.158, 0.163] |

## Per-document latency

Median [min,max] milliseconds across fresh processes. Use these rows to inspect whether a category gain hides a particular regression.

| Document | Mode | Operation | Entry | ms median [min,max] |
|---|---|---|---|---:|
| support | repeated | encode | baseline | 0.010258 [0.009981, 0.011802] |
| support | repeated | encode | candidate | 0.007055 [0.006525, 0.008471] |
| support | repeated | encode | ai-tokenizer | 0.009070 [0.008488, 0.009357] |
| support | repeated | encode | bpe-lite | 0.007945 [0.007644, 0.008236] |
| support | repeated | encode | @goliapkg/tiktoken-wasm | 0.003213 [0.002806, 0.003738] |
| support | repeated | encode | tiktoken | 0.077207 [0.073894, 0.085851] |
| support | repeated | decode | baseline | 0.000401 [0.000382, 0.000425] |
| support | repeated | decode | candidate | 0.000463 [0.000447, 0.000518] |
| support | repeated | decode | ai-tokenizer | 0.000384 [0.000379, 0.000398] |
| support | repeated | decode | bpe-lite | 0.001624 [0.001570, 0.001651] |
| support | repeated | decode | @goliapkg/tiktoken-wasm | 0.001032 [0.001017, 0.001077] |
| support | repeated | decode | tiktoken | 0.002056 [0.001886, 0.002396] |
| support | repeated | count | baseline | 0.010309 [0.010170, 0.012344] |
| support | repeated | count | candidate | 0.006508 [0.006465, 0.006960] |
| support | repeated | count | ai-tokenizer | 0.009291 [0.008688, 0.009641] |
| support | repeated | count | bpe-lite | 0.007854 [0.007726, 0.008937] |
| support | repeated | count | @goliapkg/tiktoken-wasm | 0.001629 [0.001625, 0.001683] |
| support | repeated | count | tiktoken | 0.073382 [0.072319, 0.084429] |
| support | stream | encode | baseline | 0.013152 [0.012796, 0.015472] |
| support | stream | encode | candidate | 0.009341 [0.008651, 0.009722] |
| support | stream | encode | ai-tokenizer | 0.011645 [0.010903, 0.013004] |
| support | stream | encode | bpe-lite | 0.010258 [0.010193, 0.010815] |
| support | stream | encode | @goliapkg/tiktoken-wasm | 0.003226 [0.003215, 0.003313] |
| support | stream | encode | tiktoken | 0.084859 [0.082060, 0.090474] |
| support | stream | decode | baseline | 0.000514 [0.000501, 0.000587] |
| support | stream | decode | candidate | 0.000632 [0.000562, 0.000745] |
| support | stream | decode | ai-tokenizer | 0.000483 [0.000476, 0.000500] |
| support | stream | decode | bpe-lite | 0.002009 [0.002007, 0.002439] |
| support | stream | decode | @goliapkg/tiktoken-wasm | 0.001298 [0.001255, 0.001409] |
| support | stream | decode | tiktoken | 0.002391 [0.002149, 0.002749] |
| support | stream | count | baseline | 0.012712 [0.012152, 0.015583] |
| support | stream | count | candidate | 0.008456 [0.008358, 0.009787] |
| support | stream | count | ai-tokenizer | 0.011452 [0.010876, 0.011721] |
| support | stream | count | bpe-lite | 0.009997 [0.009694, 0.011769] |
| support | stream | count | @goliapkg/tiktoken-wasm | 0.001892 [0.001846, 0.001920] |
| support | stream | count | tiktoken | 0.085547 [0.083569, 0.090378] |
| design | repeated | encode | baseline | 0.006462 [0.006335, 0.007478] |
| design | repeated | encode | candidate | 0.004257 [0.003957, 0.004975] |
| design | repeated | encode | ai-tokenizer | 0.006345 [0.006119, 0.007755] |
| design | repeated | encode | bpe-lite | 0.005291 [0.005037, 0.005590] |
| design | repeated | encode | @goliapkg/tiktoken-wasm | 0.002861 [0.002795, 0.003080] |
| design | repeated | encode | tiktoken | 0.077883 [0.075768, 0.082403] |
| design | repeated | decode | baseline | 0.000410 [0.000399, 0.000449] |
| design | repeated | decode | candidate | 0.000480 [0.000460, 0.000551] |
| design | repeated | decode | ai-tokenizer | 0.000395 [0.000373, 0.000419] |
| design | repeated | decode | bpe-lite | 0.001730 [0.001707, 0.001826] |
| design | repeated | decode | @goliapkg/tiktoken-wasm | 0.001026 [0.000987, 0.001087] |
| design | repeated | decode | tiktoken | 0.002021 [0.001962, 0.002298] |
| design | repeated | count | baseline | 0.006574 [0.006305, 0.007177] |
| design | repeated | count | candidate | 0.004058 [0.003789, 0.004687] |
| design | repeated | count | ai-tokenizer | 0.006518 [0.006240, 0.006945] |
| design | repeated | count | bpe-lite | 0.005248 [0.004920, 0.005702] |
| design | repeated | count | @goliapkg/tiktoken-wasm | 0.001469 [0.001426, 0.001680] |
| design | repeated | count | tiktoken | 0.077149 [0.075557, 0.089633] |
| design | stream | encode | baseline | 0.008263 [0.007993, 0.009028] |
| design | stream | encode | candidate | 0.005471 [0.005187, 0.006321] |
| design | stream | encode | ai-tokenizer | 0.007430 [0.007253, 0.007797] |
| design | stream | encode | bpe-lite | 0.006627 [0.006504, 0.006975] |
| design | stream | encode | @goliapkg/tiktoken-wasm | 0.003195 [0.003169, 0.005303] |
| design | stream | encode | tiktoken | 0.084947 [0.084434, 0.092248] |
| design | stream | decode | baseline | 0.000530 [0.000502, 0.000618] |
| design | stream | decode | candidate | 0.000647 [0.000604, 0.000705] |
| design | stream | decode | ai-tokenizer | 0.000507 [0.000471, 0.000562] |
| design | stream | decode | bpe-lite | 0.002099 [0.002058, 0.002254] |
| design | stream | decode | @goliapkg/tiktoken-wasm | 0.001177 [0.001152, 0.001393] |
| design | stream | decode | tiktoken | 0.002309 [0.002291, 0.002497] |
| design | stream | count | baseline | 0.008218 [0.007862, 0.010659] |
| design | stream | count | candidate | 0.005339 [0.005052, 0.005581] |
| design | stream | count | ai-tokenizer | 0.007335 [0.006824, 0.008636] |
| design | stream | count | bpe-lite | 0.006354 [0.006030, 0.007067] |
| design | stream | count | @goliapkg/tiktoken-wasm | 0.001661 [0.001646, 0.001679] |
| design | stream | count | tiktoken | 0.085685 [0.084093, 0.094555] |
| release | repeated | encode | baseline | 0.008637 [0.008225, 0.009448] |
| release | repeated | encode | candidate | 0.004933 [0.004457, 0.005444] |
| release | repeated | encode | ai-tokenizer | 0.007149 [0.006362, 0.008742] |
| release | repeated | encode | bpe-lite | 0.005929 [0.005766, 0.006638] |
| release | repeated | encode | @goliapkg/tiktoken-wasm | 0.003036 [0.002994, 0.004351] |
| release | repeated | encode | tiktoken | 0.083092 [0.081726, 0.104367] |
| release | repeated | decode | baseline | 0.000446 [0.000438, 0.000516] |
| release | repeated | decode | candidate | 0.000535 [0.000525, 0.000573] |
| release | repeated | decode | ai-tokenizer | 0.000429 [0.000424, 0.000438] |
| release | repeated | decode | bpe-lite | 0.001845 [0.001800, 0.002070] |
| release | repeated | decode | @goliapkg/tiktoken-wasm | 0.001099 [0.001072, 0.001182] |
| release | repeated | decode | tiktoken | 0.002085 [0.002032, 0.002467] |
| release | repeated | count | baseline | 0.008291 [0.007963, 0.011243] |
| release | repeated | count | candidate | 0.004403 [0.004361, 0.004915] |
| release | repeated | count | ai-tokenizer | 0.006790 [0.006671, 0.007093] |
| release | repeated | count | bpe-lite | 0.005746 [0.005464, 0.006243] |
| release | repeated | count | @goliapkg/tiktoken-wasm | 0.001682 [0.001661, 0.001920] |
| release | repeated | count | tiktoken | 0.086822 [0.082533, 0.095912] |
| release | stream | encode | baseline | 0.010051 [0.009686, 0.013292] |
| release | stream | encode | candidate | 0.006103 [0.005992, 0.006353] |
| release | stream | encode | ai-tokenizer | 0.007850 [0.007740, 0.008502] |
| release | stream | encode | bpe-lite | 0.007442 [0.007185, 0.008913] |
| release | stream | encode | @goliapkg/tiktoken-wasm | 0.003493 [0.003358, 0.003910] |
| release | stream | encode | tiktoken | 0.094081 [0.089598, 0.096199] |
| release | stream | decode | baseline | 0.000595 [0.000552, 0.000736] |
| release | stream | decode | candidate | 0.000680 [0.000671, 0.000772] |
| release | stream | decode | ai-tokenizer | 0.000528 [0.000525, 0.000552] |
| release | stream | decode | bpe-lite | 0.002310 [0.002244, 0.002499] |
| release | stream | decode | @goliapkg/tiktoken-wasm | 0.001251 [0.001218, 0.001520] |
| release | stream | decode | tiktoken | 0.002314 [0.002262, 0.002557] |
| release | stream | count | baseline | 0.009838 [0.009480, 0.010784] |
| release | stream | count | candidate | 0.005724 [0.005564, 0.006002] |
| release | stream | count | ai-tokenizer | 0.008076 [0.007620, 0.008835] |
| release | stream | count | bpe-lite | 0.007175 [0.006915, 0.008757] |
| release | stream | count | @goliapkg/tiktoken-wasm | 0.001847 [0.001808, 0.002050] |
| release | stream | count | tiktoken | 0.089597 [0.088440, 0.099016] |
| typescript | repeated | encode | baseline | 0.008704 [0.008587, 0.009418] |
| typescript | repeated | encode | candidate | 0.005990 [0.005782, 0.006483] |
| typescript | repeated | encode | ai-tokenizer | 0.008101 [0.007970, 0.008293] |
| typescript | repeated | encode | bpe-lite | 0.007486 [0.007414, 0.008188] |
| typescript | repeated | encode | @goliapkg/tiktoken-wasm | 0.003410 [0.003352, 0.003589] |
| typescript | repeated | encode | tiktoken | 0.091853 [0.090573, 0.113585] |
| typescript | repeated | decode | baseline | 0.000541 [0.000533, 0.000748] |
| typescript | repeated | decode | candidate | 0.000634 [0.000628, 0.000690] |
| typescript | repeated | decode | ai-tokenizer | 0.000509 [0.000506, 0.000528] |
| typescript | repeated | decode | bpe-lite | 0.002190 [0.002094, 0.002455] |
| typescript | repeated | decode | @goliapkg/tiktoken-wasm | 0.001164 [0.001151, 0.001211] |
| typescript | repeated | decode | tiktoken | 0.002248 [0.002126, 0.002431] |
| typescript | repeated | count | baseline | 0.009130 [0.008487, 0.023746] |
| typescript | repeated | count | candidate | 0.005686 [0.005485, 0.006052] |
| typescript | repeated | count | ai-tokenizer | 0.008253 [0.008070, 0.008412] |
| typescript | repeated | count | bpe-lite | 0.007302 [0.006812, 0.007926] |
| typescript | repeated | count | @goliapkg/tiktoken-wasm | 0.001823 [0.001782, 0.001951] |
| typescript | repeated | count | tiktoken | 0.093716 [0.090233, 0.106999] |
| typescript | stream | encode | baseline | 0.010969 [0.010242, 0.030380] |
| typescript | stream | encode | candidate | 0.007218 [0.007074, 0.008225] |
| typescript | stream | encode | ai-tokenizer | 0.009187 [0.009120, 0.010053] |
| typescript | stream | encode | bpe-lite | 0.008895 [0.008530, 0.009778] |
| typescript | stream | encode | @goliapkg/tiktoken-wasm | 0.003905 [0.003699, 0.004744] |
| typescript | stream | encode | tiktoken | 0.099689 [0.098875, 0.107797] |
| typescript | stream | decode | baseline | 0.000665 [0.000655, 0.000993] |
| typescript | stream | decode | candidate | 0.000804 [0.000764, 0.000841] |
| typescript | stream | decode | ai-tokenizer | 0.000635 [0.000618, 0.000668] |
| typescript | stream | decode | bpe-lite | 0.002644 [0.002505, 0.002733] |
| typescript | stream | decode | @goliapkg/tiktoken-wasm | 0.001375 [0.001336, 0.001693] |
| typescript | stream | decode | tiktoken | 0.002416 [0.002343, 0.002584] |
| typescript | stream | count | baseline | 0.011399 [0.010097, 0.019123] |
| typescript | stream | count | candidate | 0.006937 [0.006507, 0.007935] |
| typescript | stream | count | ai-tokenizer | 0.009523 [0.009062, 0.009931] |
| typescript | stream | count | bpe-lite | 0.008284 [0.007934, 0.008784] |
| typescript | stream | count | @goliapkg/tiktoken-wasm | 0.002124 [0.002070, 0.002195] |
| typescript | stream | count | tiktoken | 0.104770 [0.099972, 0.123675] |
| python | repeated | encode | baseline | 0.008678 [0.008273, 0.009598] |
| python | repeated | encode | candidate | 0.005109 [0.004920, 0.005473] |
| python | repeated | encode | ai-tokenizer | 0.007255 [0.006902, 0.008190] |
| python | repeated | encode | bpe-lite | 0.006207 [0.006125, 0.007097] |
| python | repeated | encode | @goliapkg/tiktoken-wasm | 0.003529 [0.003176, 0.003814] |
| python | repeated | encode | tiktoken | 0.084706 [0.082401, 0.098598] |
| python | repeated | decode | baseline | 0.000461 [0.000442, 0.000528] |
| python | repeated | decode | candidate | 0.000562 [0.000523, 0.000614] |
| python | repeated | decode | ai-tokenizer | 0.000434 [0.000417, 0.000441] |
| python | repeated | decode | bpe-lite | 0.001805 [0.001778, 0.001952] |
| python | repeated | decode | @goliapkg/tiktoken-wasm | 0.001127 [0.000984, 0.001155] |
| python | repeated | decode | tiktoken | 0.002126 [0.002025, 0.002509] |
| python | repeated | count | baseline | 0.008466 [0.008219, 0.009998] |
| python | repeated | count | candidate | 0.004993 [0.004752, 0.005390] |
| python | repeated | count | ai-tokenizer | 0.007617 [0.007018, 0.007980] |
| python | repeated | count | bpe-lite | 0.006422 [0.005790, 0.006760] |
| python | repeated | count | @goliapkg/tiktoken-wasm | 0.001926 [0.001870, 0.003252] |
| python | repeated | count | tiktoken | 0.083574 [0.081801, 0.098344] |
| python | stream | encode | baseline | 0.010339 [0.010015, 0.011562] |
| python | stream | encode | candidate | 0.006308 [0.006199, 0.008127] |
| python | stream | encode | ai-tokenizer | 0.008390 [0.008236, 0.009237] |
| python | stream | encode | bpe-lite | 0.007650 [0.007321, 0.007791] |
| python | stream | encode | @goliapkg/tiktoken-wasm | 0.003619 [0.003567, 0.006189] |
| python | stream | encode | tiktoken | 0.092940 [0.090476, 0.099922] |
| python | stream | decode | baseline | 0.000604 [0.000564, 0.000723] |
| python | stream | decode | candidate | 0.000728 [0.000651, 0.000766] |
| python | stream | decode | ai-tokenizer | 0.000549 [0.000528, 0.000595] |
| python | stream | decode | bpe-lite | 0.002264 [0.002239, 0.002376] |
| python | stream | decode | @goliapkg/tiktoken-wasm | 0.001268 [0.001158, 0.001290] |
| python | stream | decode | tiktoken | 0.002396 [0.002208, 0.002611] |
| python | stream | count | baseline | 0.010292 [0.009652, 0.010725] |
| python | stream | count | candidate | 0.006187 [0.005991, 0.007112] |
| python | stream | count | ai-tokenizer | 0.008201 [0.008105, 0.008551] |
| python | stream | count | bpe-lite | 0.007354 [0.006870, 0.009077] |
| python | stream | count | @goliapkg/tiktoken-wasm | 0.002127 [0.002099, 0.002305] |
| python | stream | count | tiktoken | 0.091633 [0.090701, 0.123658] |
| sql | repeated | encode | baseline | 0.007701 [0.007384, 0.010253] |
| sql | repeated | encode | candidate | 0.004375 [0.004202, 0.004732] |
| sql | repeated | encode | ai-tokenizer | 0.006962 [0.006505, 0.007175] |
| sql | repeated | encode | bpe-lite | 0.005875 [0.005594, 0.006448] |
| sql | repeated | encode | @goliapkg/tiktoken-wasm | 0.002932 [0.002831, 0.003463] |
| sql | repeated | encode | tiktoken | 0.087305 [0.085281, 0.092865] |
| sql | repeated | decode | baseline | 0.000439 [0.000413, 0.000516] |
| sql | repeated | decode | candidate | 0.000513 [0.000503, 0.000585] |
| sql | repeated | decode | ai-tokenizer | 0.000409 [0.000404, 0.000417] |
| sql | repeated | decode | bpe-lite | 0.001709 [0.001677, 0.001850] |
| sql | repeated | decode | @goliapkg/tiktoken-wasm | 0.000980 [0.000945, 0.001018] |
| sql | repeated | decode | tiktoken | 0.001975 [0.001861, 0.002240] |
| sql | repeated | count | baseline | 0.007631 [0.007611, 0.008190] |
| sql | repeated | count | candidate | 0.004231 [0.004006, 0.004621] |
| sql | repeated | count | ai-tokenizer | 0.006647 [0.006460, 0.006972] |
| sql | repeated | count | bpe-lite | 0.005620 [0.005319, 0.006301] |
| sql | repeated | count | @goliapkg/tiktoken-wasm | 0.001610 [0.001559, 0.001690] |
| sql | repeated | count | tiktoken | 0.085625 [0.084014, 0.099245] |
| sql | stream | encode | baseline | 0.010327 [0.009169, 0.010588] |
| sql | stream | encode | candidate | 0.005759 [0.005551, 0.006918] |
| sql | stream | encode | ai-tokenizer | 0.007892 [0.007541, 0.008190] |
| sql | stream | encode | bpe-lite | 0.007100 [0.006901, 0.007575] |
| sql | stream | encode | @goliapkg/tiktoken-wasm | 0.003376 [0.003250, 0.003745] |
| sql | stream | encode | tiktoken | 0.092392 [0.090436, 0.098726] |
| sql | stream | decode | baseline | 0.000597 [0.000525, 0.000655] |
| sql | stream | decode | candidate | 0.000670 [0.000638, 0.000782] |
| sql | stream | decode | ai-tokenizer | 0.000518 [0.000517, 0.000531] |
| sql | stream | decode | bpe-lite | 0.002119 [0.002033, 0.002529] |
| sql | stream | decode | @goliapkg/tiktoken-wasm | 0.001094 [0.001061, 0.001174] |
| sql | stream | decode | tiktoken | 0.002207 [0.002181, 0.002398] |
| sql | stream | count | baseline | 0.009338 [0.008828, 0.010358] |
| sql | stream | count | candidate | 0.005324 [0.005171, 0.007018] |
| sql | stream | count | ai-tokenizer | 0.007975 [0.007840, 0.009002] |
| sql | stream | count | bpe-lite | 0.006743 [0.006443, 0.006984] |
| sql | stream | count | @goliapkg/tiktoken-wasm | 0.001878 [0.001836, 0.001995] |
| sql | stream | count | tiktoken | 0.095610 [0.091603, 0.107648] |
| api-json | repeated | encode | baseline | 0.008818 [0.008579, 0.009261] |
| api-json | repeated | encode | candidate | 0.004913 [0.004704, 0.005957] |
| api-json | repeated | encode | ai-tokenizer | 0.007009 [0.006956, 0.007795] |
| api-json | repeated | encode | bpe-lite | 0.006423 [0.006079, 0.006861] |
| api-json | repeated | encode | @goliapkg/tiktoken-wasm | 0.002765 [0.002592, 0.002961] |
| api-json | repeated | encode | tiktoken | 0.078557 [0.077227, 0.084773] |
| api-json | repeated | decode | baseline | 0.000500 [0.000495, 0.000538] |
| api-json | repeated | decode | candidate | 0.000599 [0.000586, 0.001300] |
| api-json | repeated | decode | ai-tokenizer | 0.000485 [0.000468, 0.000511] |
| api-json | repeated | decode | bpe-lite | 0.001994 [0.001905, 0.002081] |
| api-json | repeated | decode | @goliapkg/tiktoken-wasm | 0.000968 [0.000948, 0.001107] |
| api-json | repeated | decode | tiktoken | 0.002065 [0.001982, 0.002887] |
| api-json | repeated | count | baseline | 0.008768 [0.008729, 0.010368] |
| api-json | repeated | count | candidate | 0.004543 [0.004488, 0.006642] |
| api-json | repeated | count | ai-tokenizer | 0.007087 [0.006825, 0.007910] |
| api-json | repeated | count | bpe-lite | 0.006032 [0.005751, 0.006210] |
| api-json | repeated | count | @goliapkg/tiktoken-wasm | 0.001312 [0.001281, 0.001428] |
| api-json | repeated | count | tiktoken | 0.078570 [0.077268, 0.085639] |
| api-json | stream | encode | baseline | 0.010552 [0.010117, 0.011295] |
| api-json | stream | encode | candidate | 0.006207 [0.005953, 0.008465] |
| api-json | stream | encode | ai-tokenizer | 0.008273 [0.007944, 0.008846] |
| api-json | stream | encode | bpe-lite | 0.007904 [0.007373, 0.008411] |
| api-json | stream | encode | @goliapkg/tiktoken-wasm | 0.003248 [0.003100, 0.003481] |
| api-json | stream | encode | tiktoken | 0.088892 [0.086653, 0.101773] |
| api-json | stream | decode | baseline | 0.000640 [0.000616, 0.000678] |
| api-json | stream | decode | candidate | 0.000735 [0.000710, 0.000965] |
| api-json | stream | decode | ai-tokenizer | 0.000576 [0.000566, 0.000638] |
| api-json | stream | decode | bpe-lite | 0.002426 [0.002334, 0.002739] |
| api-json | stream | decode | @goliapkg/tiktoken-wasm | 0.001203 [0.001138, 0.001258] |
| api-json | stream | decode | tiktoken | 0.002359 [0.002285, 0.002594] |
| api-json | stream | count | baseline | 0.010098 [0.009871, 0.011417] |
| api-json | stream | count | candidate | 0.005881 [0.005681, 0.006160] |
| api-json | stream | count | ai-tokenizer | 0.008098 [0.007945, 0.008543] |
| api-json | stream | count | bpe-lite | 0.007042 [0.006772, 0.007979] |
| api-json | stream | count | @goliapkg/tiktoken-wasm | 0.001593 [0.001577, 0.001817] |
| api-json | stream | count | tiktoken | 0.088943 [0.087199, 0.109596] |
| chat-json | repeated | encode | baseline | 0.009901 [0.009287, 0.011284] |
| chat-json | repeated | encode | candidate | 0.005446 [0.005365, 0.007128] |
| chat-json | repeated | encode | ai-tokenizer | 0.007720 [0.007424, 0.007747] |
| chat-json | repeated | encode | bpe-lite | 0.006885 [0.006698, 0.007469] |
| chat-json | repeated | encode | @goliapkg/tiktoken-wasm | 0.003290 [0.003242, 0.003634] |
| chat-json | repeated | encode | tiktoken | 0.088381 [0.085380, 0.100765] |
| chat-json | repeated | decode | baseline | 0.000543 [0.000520, 0.000578] |
| chat-json | repeated | decode | candidate | 0.000657 [0.000637, 0.000707] |
| chat-json | repeated | decode | ai-tokenizer | 0.000535 [0.000505, 0.000587] |
| chat-json | repeated | decode | bpe-lite | 0.002116 [0.002084, 0.002206] |
| chat-json | repeated | decode | @goliapkg/tiktoken-wasm | 0.001180 [0.001132, 0.001240] |
| chat-json | repeated | decode | tiktoken | 0.002270 [0.002071, 0.002693] |
| chat-json | repeated | count | baseline | 0.009079 [0.008724, 0.010101] |
| chat-json | repeated | count | candidate | 0.005179 [0.005022, 0.006050] |
| chat-json | repeated | count | ai-tokenizer | 0.007776 [0.007488, 0.007988] |
| chat-json | repeated | count | bpe-lite | 0.006474 [0.006161, 0.006556] |
| chat-json | repeated | count | @goliapkg/tiktoken-wasm | 0.001883 [0.001796, 0.001951] |
| chat-json | repeated | count | tiktoken | 0.088652 [0.085179, 0.096304] |
| chat-json | stream | encode | baseline | 0.011150 [0.010540, 0.012612] |
| chat-json | stream | encode | candidate | 0.006726 [0.006574, 0.007317] |
| chat-json | stream | encode | ai-tokenizer | 0.008597 [0.008466, 0.008654] |
| chat-json | stream | encode | bpe-lite | 0.008268 [0.007866, 0.008911] |
| chat-json | stream | encode | @goliapkg/tiktoken-wasm | 0.003679 [0.003592, 0.004084] |
| chat-json | stream | encode | tiktoken | 0.100066 [0.094723, 0.125487] |
| chat-json | stream | decode | baseline | 0.000702 [0.000628, 0.000767] |
| chat-json | stream | decode | candidate | 0.000811 [0.000782, 0.000938] |
| chat-json | stream | decode | ai-tokenizer | 0.000619 [0.000604, 0.000640] |
| chat-json | stream | decode | bpe-lite | 0.002517 [0.002481, 0.002642] |
| chat-json | stream | decode | @goliapkg/tiktoken-wasm | 0.001353 [0.001300, 0.001484] |
| chat-json | stream | decode | tiktoken | 0.002495 [0.002374, 0.002702] |
| chat-json | stream | count | baseline | 0.011158 [0.010295, 0.013354] |
| chat-json | stream | count | candidate | 0.006426 [0.006257, 0.006847] |
| chat-json | stream | count | ai-tokenizer | 0.008616 [0.008420, 0.009316] |
| chat-json | stream | count | bpe-lite | 0.007546 [0.007440, 0.007664] |
| chat-json | stream | count | @goliapkg/tiktoken-wasm | 0.002001 [0.001969, 0.002533] |
| chat-json | stream | count | tiktoken | 0.100903 [0.094199, 0.107200] |
| logs | repeated | encode | baseline | 0.011258 [0.010809, 0.012537] |
| logs | repeated | encode | candidate | 0.006139 [0.006062, 0.006612] |
| logs | repeated | encode | ai-tokenizer | 0.008604 [0.008375, 0.010201] |
| logs | repeated | encode | bpe-lite | 0.008316 [0.008126, 0.008819] |
| logs | repeated | encode | @goliapkg/tiktoken-wasm | 0.003667 [0.003624, 0.004047] |
| logs | repeated | encode | tiktoken | 0.105595 [0.101049, 0.121200] |
| logs | repeated | decode | baseline | 0.000744 [0.000711, 0.000838] |
| logs | repeated | decode | candidate | 0.000883 [0.000833, 0.000957] |
| logs | repeated | decode | ai-tokenizer | 0.000699 [0.000683, 0.000707] |
| logs | repeated | decode | bpe-lite | 0.002882 [0.002764, 0.002913] |
| logs | repeated | decode | @goliapkg/tiktoken-wasm | 0.001330 [0.001268, 0.001347] |
| logs | repeated | decode | tiktoken | 0.002444 [0.002332, 0.002640] |
| logs | repeated | count | baseline | 0.010978 [0.010674, 0.013644] |
| logs | repeated | count | candidate | 0.005891 [0.005576, 0.006365] |
| logs | repeated | count | ai-tokenizer | 0.008687 [0.008539, 0.009120] |
| logs | repeated | count | bpe-lite | 0.007765 [0.007590, 0.007963] |
| logs | repeated | count | @goliapkg/tiktoken-wasm | 0.001911 [0.001800, 0.002041] |
| logs | repeated | count | tiktoken | 0.105418 [0.098568, 0.108963] |
| logs | stream | encode | baseline | 0.012943 [0.012715, 0.014403] |
| logs | stream | encode | candidate | 0.007398 [0.006909, 0.007686] |
| logs | stream | encode | ai-tokenizer | 0.009815 [0.009557, 0.011573] |
| logs | stream | encode | bpe-lite | 0.009488 [0.009320, 0.010411] |
| logs | stream | encode | @goliapkg/tiktoken-wasm | 0.004232 [0.004022, 0.006736] |
| logs | stream | encode | tiktoken | 0.110934 [0.107744, 0.114187] |
| logs | stream | decode | baseline | 0.001007 [0.000877, 0.001109] |
| logs | stream | decode | candidate | 0.001069 [0.001027, 0.001316] |
| logs | stream | decode | ai-tokenizer | 0.000846 [0.000821, 0.000855] |
| logs | stream | decode | bpe-lite | 0.003277 [0.003162, 0.003336] |
| logs | stream | decode | @goliapkg/tiktoken-wasm | 0.001530 [0.001446, 0.002493] |
| logs | stream | decode | tiktoken | 0.002606 [0.002517, 0.002910] |
| logs | stream | count | baseline | 0.012627 [0.012440, 0.015238] |
| logs | stream | count | candidate | 0.006990 [0.006884, 0.007043] |
| logs | stream | count | ai-tokenizer | 0.009824 [0.009457, 0.010695] |
| logs | stream | count | bpe-lite | 0.009022 [0.008835, 0.009421] |
| logs | stream | count | @goliapkg/tiktoken-wasm | 0.002127 [0.002063, 0.002205] |
| logs | stream | count | tiktoken | 0.109309 [0.106302, 0.126800] |
| cjk | repeated | encode | baseline | 0.007843 [0.007597, 0.008425] |
| cjk | repeated | encode | candidate | 0.004430 [0.004183, 0.004497] |
| cjk | repeated | encode | ai-tokenizer | 0.005573 [0.005523, 0.005700] |
| cjk | repeated | encode | bpe-lite | 0.004733 [0.004654, 0.005189] |
| cjk | repeated | encode | @goliapkg/tiktoken-wasm | 0.003379 [0.003308, 0.003796] |
| cjk | repeated | encode | tiktoken | 0.077516 [0.074354, 0.084891] |
| cjk | repeated | decode | baseline | 0.000652 [0.000619, 0.000740] |
| cjk | repeated | decode | candidate | 0.000794 [0.000748, 0.000896] |
| cjk | repeated | decode | ai-tokenizer | 0.000622 [0.000609, 0.000665] |
| cjk | repeated | decode | bpe-lite | 0.002702 [0.002673, 0.003478] |
| cjk | repeated | decode | @goliapkg/tiktoken-wasm | 0.001523 [0.001425, 0.001604] |
| cjk | repeated | decode | tiktoken | 0.002398 [0.002280, 0.002806] |
| cjk | repeated | count | baseline | 0.007116 [0.006925, 0.007904] |
| cjk | repeated | count | candidate | 0.004118 [0.003986, 0.004390] |
| cjk | repeated | count | ai-tokenizer | 0.005673 [0.005481, 0.006193] |
| cjk | repeated | count | bpe-lite | 0.004509 [0.004350, 0.004914] |
| cjk | repeated | count | @goliapkg/tiktoken-wasm | 0.002494 [0.002392, 0.002783] |
| cjk | repeated | count | tiktoken | 0.075022 [0.074283, 0.086422] |
| cjk | stream | encode | baseline | 0.010597 [0.010447, 0.011575] |
| cjk | stream | encode | candidate | 0.006238 [0.006170, 0.007176] |
| cjk | stream | encode | ai-tokenizer | 0.007758 [0.007522, 0.008330] |
| cjk | stream | encode | bpe-lite | 0.007363 [0.006874, 0.008133] |
| cjk | stream | encode | @goliapkg/tiktoken-wasm | 0.003729 [0.003669, 0.004053] |
| cjk | stream | encode | tiktoken | 0.084354 [0.082803, 0.089909] |
| cjk | stream | decode | baseline | 0.000811 [0.000766, 0.000853] |
| cjk | stream | decode | candidate | 0.000953 [0.000895, 0.001129] |
| cjk | stream | decode | ai-tokenizer | 0.000770 [0.000720, 0.000776] |
| cjk | stream | decode | bpe-lite | 0.003246 [0.003029, 0.003658] |
| cjk | stream | decode | @goliapkg/tiktoken-wasm | 0.001662 [0.001631, 0.001729] |
| cjk | stream | decode | tiktoken | 0.002550 [0.002497, 0.002990] |
| cjk | stream | count | baseline | 0.010242 [0.009837, 0.010834] |
| cjk | stream | count | candidate | 0.006106 [0.005809, 0.006951] |
| cjk | stream | count | ai-tokenizer | 0.007672 [0.007531, 0.007747] |
| cjk | stream | count | bpe-lite | 0.006982 [0.006527, 0.007731] |
| cjk | stream | count | @goliapkg/tiktoken-wasm | 0.002705 [0.002607, 0.002899] |
| cjk | stream | count | tiktoken | 0.082925 [0.081312, 0.089420] |
| european | repeated | encode | baseline | 0.012280 [0.011688, 0.014913] |
| european | repeated | encode | candidate | 0.007556 [0.007472, 0.010034] |
| european | repeated | encode | ai-tokenizer | 0.009960 [0.009641, 0.010589] |
| european | repeated | encode | bpe-lite | 0.009078 [0.008630, 0.009583] |
| european | repeated | encode | @goliapkg/tiktoken-wasm | 0.005720 [0.005514, 0.006147] |
| european | repeated | encode | tiktoken | 0.085832 [0.085397, 0.094435] |
| european | repeated | decode | baseline | 0.000598 [0.000568, 0.000620] |
| european | repeated | decode | candidate | 0.000697 [0.000658, 0.000863] |
| european | repeated | decode | ai-tokenizer | 0.000545 [0.000531, 0.000567] |
| european | repeated | decode | bpe-lite | 0.002689 [0.002564, 0.002896] |
| european | repeated | decode | @goliapkg/tiktoken-wasm | 0.001607 [0.001576, 0.001842] |
| european | repeated | decode | tiktoken | 0.002351 [0.002312, 0.002709] |
| european | repeated | count | baseline | 0.011897 [0.011723, 0.013400] |
| european | repeated | count | candidate | 0.007300 [0.007223, 0.009338] |
| european | repeated | count | ai-tokenizer | 0.009863 [0.009690, 0.010782] |
| european | repeated | count | bpe-lite | 0.009128 [0.008558, 0.009259] |
| european | repeated | count | @goliapkg/tiktoken-wasm | 0.004304 [0.004243, 0.004810] |
| european | repeated | count | tiktoken | 0.088246 [0.085244, 0.098293] |
| european | stream | encode | baseline | 0.015036 [0.014325, 0.017252] |
| european | stream | encode | candidate | 0.009811 [0.009715, 0.010762] |
| european | stream | encode | ai-tokenizer | 0.012350 [0.011971, 0.013228] |
| european | stream | encode | bpe-lite | 0.011806 [0.011073, 0.012486] |
| european | stream | encode | @goliapkg/tiktoken-wasm | 0.006054 [0.005970, 0.006758] |
| european | stream | encode | tiktoken | 0.094737 [0.093691, 0.117034] |
| european | stream | decode | baseline | 0.000725 [0.000677, 0.000887] |
| european | stream | decode | candidate | 0.000824 [0.000810, 0.001064] |
| european | stream | decode | ai-tokenizer | 0.000662 [0.000644, 0.000703] |
| european | stream | decode | bpe-lite | 0.003261 [0.002960, 0.003411] |
| european | stream | decode | @goliapkg/tiktoken-wasm | 0.001776 [0.001756, 0.002101] |
| european | stream | decode | tiktoken | 0.002640 [0.002452, 0.002807] |
| european | stream | count | baseline | 0.014651 [0.014136, 0.016546] |
| european | stream | count | candidate | 0.009391 [0.009348, 0.010289] |
| european | stream | count | ai-tokenizer | 0.012275 [0.011935, 0.013039] |
| european | stream | count | bpe-lite | 0.010927 [0.010798, 0.012119] |
| european | stream | count | @goliapkg/tiktoken-wasm | 0.004569 [0.004459, 0.005615] |
| european | stream | count | tiktoken | 0.099397 [0.094231, 0.107254] |
| mixed | repeated | encode | baseline | 0.013115 [0.012885, 0.013803] |
| mixed | repeated | encode | candidate | 0.008119 [0.007878, 0.009336] |
| mixed | repeated | encode | ai-tokenizer | 0.009895 [0.009602, 0.010189] |
| mixed | repeated | encode | bpe-lite | 0.009722 [0.009246, 0.010694] |
| mixed | repeated | encode | @goliapkg/tiktoken-wasm | 0.006965 [0.006749, 0.007310] |
| mixed | repeated | encode | tiktoken | 0.084824 [0.078611, 0.101838] |
| mixed | repeated | decode | baseline | 0.007069 [0.005734, 0.008987] |
| mixed | repeated | decode | candidate | 0.004366 [0.003758, 0.004506] |
| mixed | repeated | decode | ai-tokenizer | 0.008961 [0.008447, 0.009462] |
| mixed | repeated | decode | bpe-lite | 0.002595 [0.002492, 0.002764] |
| mixed | repeated | decode | @goliapkg/tiktoken-wasm | 0.001626 [0.001590, 0.001980] |
| mixed | repeated | decode | tiktoken | 0.002412 [0.002298, 0.002816] |
| mixed | repeated | count | baseline | 0.012488 [0.012186, 0.014825] |
| mixed | repeated | count | candidate | 0.007727 [0.007493, 0.008874] |
| mixed | repeated | count | ai-tokenizer | 0.009988 [0.009674, 0.010420] |
| mixed | repeated | count | bpe-lite | 0.009526 [0.008840, 0.009730] |
| mixed | repeated | count | @goliapkg/tiktoken-wasm | 0.005861 [0.005730, 0.006339] |
| mixed | repeated | count | tiktoken | 0.083356 [0.078285, 0.100215] |
| mixed | stream | encode | baseline | 0.016108 [0.016052, 0.017025] |
| mixed | stream | encode | candidate | 0.010050 [0.009989, 0.011468] |
| mixed | stream | encode | ai-tokenizer | 0.011960 [0.011777, 0.012624] |
| mixed | stream | encode | bpe-lite | 0.012256 [0.011816, 0.012970] |
| mixed | stream | encode | @goliapkg/tiktoken-wasm | 0.007534 [0.007399, 0.007787] |
| mixed | stream | encode | tiktoken | 0.093026 [0.088161, 0.107587] |
| mixed | stream | decode | baseline | 0.007231 [0.006167, 0.008480] |
| mixed | stream | decode | candidate | 0.003848 [0.003652, 0.004628] |
| mixed | stream | decode | ai-tokenizer | 0.009501 [0.008125, 0.010141] |
| mixed | stream | decode | bpe-lite | 0.003028 [0.002993, 0.003398] |
| mixed | stream | decode | @goliapkg/tiktoken-wasm | 0.001890 [0.001775, 0.002004] |
| mixed | stream | decode | tiktoken | 0.002705 [0.002483, 0.003043] |
| mixed | stream | count | baseline | 0.015617 [0.014882, 0.017950] |
| mixed | stream | count | candidate | 0.009973 [0.009625, 0.010496] |
| mixed | stream | count | ai-tokenizer | 0.011879 [0.011806, 0.012287] |
| mixed | stream | count | bpe-lite | 0.011739 [0.011249, 0.011869] |
| mixed | stream | count | @goliapkg/tiktoken-wasm | 0.006379 [0.006026, 0.006811] |
| mixed | stream | count | tiktoken | 0.091340 [0.089474, 0.108462] |
| readme.md | repeated | encode | baseline | 1.070995 [0.981602, 1.173760] |
| readme.md | repeated | encode | candidate | 0.833348 [0.820320, 0.901835] |
| readme.md | repeated | encode | ai-tokenizer | 0.795336 [0.777799, 0.803933] |
| readme.md | repeated | encode | bpe-lite | 0.842144 [0.793903, 0.993229] |
| readme.md | repeated | encode | @goliapkg/tiktoken-wasm | 0.145939 [0.145149, 0.169221] |
| readme.md | repeated | encode | tiktoken | 3.064203 [2.931589, 3.285975] |
| readme.md | repeated | decode | baseline | 0.033785 [0.033361, 0.044005] |
| readme.md | repeated | decode | candidate | 0.031595 [0.030521, 0.032961] |
| readme.md | repeated | decode | ai-tokenizer | 0.033205 [0.032156, 0.036533] |
| readme.md | repeated | decode | bpe-lite | 0.154749 [0.151459, 0.186314] |
| readme.md | repeated | decode | @goliapkg/tiktoken-wasm | 0.057944 [0.056456, 0.059354] |
| readme.md | repeated | decode | tiktoken | 0.090449 [0.087832, 0.105536] |
| readme.md | repeated | count | baseline | 0.985064 [0.944943, 1.165274] |
| readme.md | repeated | count | candidate | 0.807923 [0.799312, 0.834564] |
| readme.md | repeated | count | ai-tokenizer | 0.785383 [0.768813, 0.823452] |
| readme.md | repeated | count | bpe-lite | 0.768459 [0.740661, 0.922919] |
| readme.md | repeated | count | @goliapkg/tiktoken-wasm | 0.087758 [0.086556, 0.105855] |
| readme.md | repeated | count | tiktoken | 3.081715 [2.923727, 3.482662] |
| readme.md | stream | encode | baseline | 1.013432 [0.984937, 1.273067] |
| readme.md | stream | encode | candidate | 0.847150 [0.841039, 0.911681] |
| readme.md | stream | encode | ai-tokenizer | 0.783439 [0.769420, 0.813003] |
| readme.md | stream | encode | bpe-lite | 0.824379 [0.792674, 0.993912] |
| readme.md | stream | encode | @goliapkg/tiktoken-wasm | 0.151027 [0.146050, 0.191579] |
| readme.md | stream | encode | tiktoken | 3.119159 [2.988133, 3.347393] |
| readme.md | stream | decode | baseline | 0.036382 [0.034010, 0.041477] |
| readme.md | stream | decode | candidate | 0.031258 [0.030667, 0.033226] |
| readme.md | stream | decode | ai-tokenizer | 0.033333 [0.032564, 0.034855] |
| readme.md | stream | decode | bpe-lite | 0.156702 [0.152896, 0.188349] |
| readme.md | stream | decode | @goliapkg/tiktoken-wasm | 0.059138 [0.057053, 0.067463] |
| readme.md | stream | decode | tiktoken | 0.092692 [0.086380, 0.098268] |
| readme.md | stream | count | baseline | 0.977915 [0.968477, 1.108401] |
| readme.md | stream | count | candidate | 0.805835 [0.775336, 0.843134] |
| readme.md | stream | count | ai-tokenizer | 0.784447 [0.755913, 0.909148] |
| readme.md | stream | count | bpe-lite | 0.826282 [0.797886, 0.924338] |
| readme.md | stream | count | @goliapkg/tiktoken-wasm | 0.094584 [0.089488, 0.100617] |
| readme.md | stream | count | tiktoken | 3.101643 [2.970979, 3.928933] |
| encoding.ts | repeated | encode | baseline | 0.682341 [0.664437, 0.853833] |
| encoding.ts | repeated | encode | candidate | 0.537993 [0.529201, 0.581432] |
| encoding.ts | repeated | encode | ai-tokenizer | 0.495300 [0.480803, 0.537584] |
| encoding.ts | repeated | encode | bpe-lite | 0.551741 [0.513404, 0.559690] |
| encoding.ts | repeated | encode | @goliapkg/tiktoken-wasm | 0.209717 [0.201505, 0.235139] |
| encoding.ts | repeated | encode | tiktoken | 3.628673 [3.460096, 3.837639] |
| encoding.ts | repeated | decode | baseline | 0.033845 [0.032220, 0.035565] |
| encoding.ts | repeated | decode | candidate | 0.031136 [0.029844, 0.034308] |
| encoding.ts | repeated | decode | ai-tokenizer | 0.030311 [0.029854, 0.030893] |
| encoding.ts | repeated | decode | bpe-lite | 0.148216 [0.145742, 0.157956] |
| encoding.ts | repeated | decode | @goliapkg/tiktoken-wasm | 0.055036 [0.053960, 0.058825] |
| encoding.ts | repeated | decode | tiktoken | 0.080981 [0.078140, 0.085390] |
| encoding.ts | repeated | count | baseline | 0.653017 [0.624169, 0.766140] |
| encoding.ts | repeated | count | candidate | 0.500369 [0.487559, 0.550343] |
| encoding.ts | repeated | count | ai-tokenizer | 0.497626 [0.488090, 0.542855] |
| encoding.ts | repeated | count | bpe-lite | 0.507391 [0.505338, 0.551726] |
| encoding.ts | repeated | count | @goliapkg/tiktoken-wasm | 0.153749 [0.149417, 0.173127] |
| encoding.ts | repeated | count | tiktoken | 3.857495 [3.498053, 4.178551] |
| encoding.ts | stream | encode | baseline | 0.697926 [0.643759, 0.861029] |
| encoding.ts | stream | encode | candidate | 0.537835 [0.526142, 0.614627] |
| encoding.ts | stream | encode | ai-tokenizer | 0.504468 [0.489695, 0.559227] |
| encoding.ts | stream | encode | bpe-lite | 0.551726 [0.536006, 0.570739] |
| encoding.ts | stream | encode | @goliapkg/tiktoken-wasm | 0.211547 [0.205890, 0.326795] |
| encoding.ts | stream | encode | tiktoken | 3.713239 [3.596421, 4.214482] |
| encoding.ts | stream | decode | baseline | 0.033928 [0.032299, 0.036835] |
| encoding.ts | stream | decode | candidate | 0.031822 [0.029406, 0.034589] |
| encoding.ts | stream | decode | ai-tokenizer | 0.032808 [0.029719, 0.040496] |
| encoding.ts | stream | decode | bpe-lite | 0.151336 [0.145724, 0.170344] |
| encoding.ts | stream | decode | @goliapkg/tiktoken-wasm | 0.056161 [0.054178, 0.095326] |
| encoding.ts | stream | decode | tiktoken | 0.080979 [0.079747, 0.089213] |
| encoding.ts | stream | count | baseline | 0.651590 [0.636737, 0.695562] |
| encoding.ts | stream | count | candidate | 0.512482 [0.504986, 0.563333] |
| encoding.ts | stream | count | ai-tokenizer | 0.515972 [0.503749, 0.533019] |
| encoding.ts | stream | count | bpe-lite | 0.517494 [0.489659, 0.856157] |
| encoding.ts | stream | count | @goliapkg/tiktoken-wasm | 0.160767 [0.150431, 0.223812] |
| encoding.ts | stream | count | tiktoken | 3.650943 [3.506876, 3.811353] |
| packages.json | repeated | encode | baseline | 0.204890 [0.189082, 0.236504] |
| packages.json | repeated | encode | candidate | 0.129903 [0.128224, 0.146157] |
| packages.json | repeated | encode | ai-tokenizer | 0.148258 [0.137698, 0.157367] |
| packages.json | repeated | encode | bpe-lite | 0.156273 [0.148231, 0.248921] |
| packages.json | repeated | encode | @goliapkg/tiktoken-wasm | 0.062471 [0.060745, 0.078222] |
| packages.json | repeated | encode | tiktoken | 1.175704 [1.120993, 1.216437] |
| packages.json | repeated | decode | baseline | 0.011799 [0.011279, 0.013265] |
| packages.json | repeated | decode | candidate | 0.011105 [0.010461, 0.012720] |
| packages.json | repeated | decode | ai-tokenizer | 0.011095 [0.010990, 0.011526] |
| packages.json | repeated | decode | bpe-lite | 0.048064 [0.046462, 0.056417] |
| packages.json | repeated | decode | @goliapkg/tiktoken-wasm | 0.016463 [0.016086, 0.019208] |
| packages.json | repeated | decode | tiktoken | 0.022206 [0.021447, 0.022698] |
| packages.json | repeated | count | baseline | 0.183749 [0.175965, 0.212709] |
| packages.json | repeated | count | candidate | 0.124005 [0.122312, 0.155923] |
| packages.json | repeated | count | ai-tokenizer | 0.146757 [0.140061, 0.152495] |
| packages.json | repeated | count | bpe-lite | 0.147777 [0.137001, 0.151352] |
| packages.json | repeated | count | @goliapkg/tiktoken-wasm | 0.045970 [0.044551, 0.055830] |
| packages.json | repeated | count | tiktoken | 1.151923 [1.118587, 1.207040] |
| packages.json | stream | encode | baseline | 0.203516 [0.193485, 0.255956] |
| packages.json | stream | encode | candidate | 0.135931 [0.133956, 0.163902] |
| packages.json | stream | encode | ai-tokenizer | 0.156290 [0.145754, 0.163905] |
| packages.json | stream | encode | bpe-lite | 0.158307 [0.150611, 0.175571] |
| packages.json | stream | encode | @goliapkg/tiktoken-wasm | 0.062751 [0.061975, 0.076681] |
| packages.json | stream | encode | tiktoken | 1.156288 [1.148595, 1.232283] |
| packages.json | stream | decode | baseline | 0.011807 [0.011599, 0.013298] |
| packages.json | stream | decode | candidate | 0.011291 [0.011178, 0.011975] |
| packages.json | stream | decode | ai-tokenizer | 0.011280 [0.011006, 0.011439] |
| packages.json | stream | decode | bpe-lite | 0.048216 [0.047526, 0.050509] |
| packages.json | stream | decode | @goliapkg/tiktoken-wasm | 0.016803 [0.016683, 0.022629] |
| packages.json | stream | decode | tiktoken | 0.022675 [0.021893, 0.023512] |
| packages.json | stream | count | baseline | 0.192966 [0.180730, 0.211100] |
| packages.json | stream | count | candidate | 0.125697 [0.124510, 0.142502] |
| packages.json | stream | count | ai-tokenizer | 0.154043 [0.141351, 0.241979] |
| packages.json | stream | count | bpe-lite | 0.145279 [0.141225, 0.158880] |
| packages.json | stream | count | @goliapkg/tiktoken-wasm | 0.046673 [0.045711, 0.078053] |
| packages.json | stream | count | tiktoken | 1.209981 [1.145550, 1.305858] |

## First-use and retained memory (unranked)

One complete document pass per fresh process before correctness/warmup. Document order is fixed, so individual first-use timings are order dependent. Initialization excludes engine startup and includes module import/factory. Heap/RSS deltas follow two event-loop turns and full GC. These are diagnostics; use the separate settled memory suite for publication.

| Entry | Initialization ms [min,max] | First-pass encode total ms [min,max] | Init heap delta MiB | First-pass heap delta MiB | First-pass RSS delta MiB |
|---|---:|---:|---:|---:|---:|
| baseline | 108.223 [105.104, 112.333] | 23.420 [22.415, 26.727] | 15.955 [15.955, 15.955] | 0.525 [0.525, 0.525] | 7.125 [6.750, 7.875] |
| candidate | 121.317 [110.733, 167.249] | 22.191 [18.776, 30.730] | 16.067 [16.066, 16.080] | 0.475 [0.462, 0.480] | 2.375 [1.750, 4.125] |
| ai-tokenizer | 287.779 [281.234, 290.593] | 18.210 [17.969, 21.482] | 26.806 [26.567, 26.806] | 0.454 [0.454, 0.467] | -11.465 [-12.906, -11.168] |
| bpe-lite | 602.011 [568.879, 795.735] | 35.462 [33.205, 45.976] | 51.208 [51.207, 51.208] | 0.867 [0.866, 0.913] | -1.707 [-2.332, 0.375] |
| @goliapkg/tiktoken-wasm | 132.665 [120.705, 143.904] | 24.100 [22.631, 31.283] | 2.391 [2.086, 2.394] | 0.059 [0.055, 0.059] | 8.000 [5.383, 11.750] |
| tiktoken | 130.895 [123.220, 197.455] | 22.566 [16.658, 29.974] | 0.218 [0.218, 0.219] | 0.064 [0.063, 0.064] | 1.453 [-2.539, 3.770] |

## Semantic probe mismatches

- baseline: {"text":" I'ſa","ids":false,"roundTrip":true,"count":false}
- baseline: {"text":"𲨓?t","ids":false,"roundTrip":true,"count":false}
- ai-tokenizer: {"text":" I'ſa","ids":false,"roundTrip":true,"count":false}
- ai-tokenizer: {"text":"𲨓?t","ids":false,"roundTrip":true,"count":false}
- ai-tokenizer: {"text":"﻿hello","ids":false,"roundTrip":false,"count":false}
- ai-tokenizer: {"text":"ab﻿c d","ids":false,"roundTrip":false,"count":false}
- bpe-lite: {"text":" I'ſa","ids":false,"roundTrip":true,"count":false}
- bpe-lite: {"text":"𲨓?t","ids":false,"roundTrip":true,"count":false}
- @goliapkg/tiktoken-wasm: {"text":" I'ſa","ids":false,"roundTrip":true,"count":false}

All timed documents and all 32 variants passed exact token IDs, count, and round-trip gates against independent tiktoken in every worker. Semantic probes above are additional non-timed cases; their failures remain disclosed.
