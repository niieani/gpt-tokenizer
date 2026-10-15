# Rejected: index every short array

This experiment routed arrays below 128 tokens through the existing indexed
string/byte-run decoder. It was rejected because short byte-heavy cl100k inputs
regressed substantially, despite faster ordinary short strings. These are
directional three-process comparisons, not final publication or acceptance runs.

Node 26.12.0 / cl100k, repeated input, microseconds per call, median [min,max]:

| Input / consumer | Frozen checkout | All-short candidate |
|---|---:|---:|
| Chinese / length | 2.009 [2.006,2.136] | 4.088 [4.073,4.363] |
| Chinese / full output | 2.307 [2.246,2.431] | 4.705 [3.881,4.919] |
| CJK / length | 7.000 [6.722,7.588] | 9.332 [9.300,9.591] |
| CJK / full output | 6.854 [6.769,6.995] | 8.000 [7.993,9.460] |

Node/o200k short prose/code/JSON API-return medians improved approximately
17–23%; Bun/o200k Chinese API-return instead regressed approximately 19%.
Outlined byte-run calls and temporary run objects are plausible contributors,
not profiled explanations. A subsequent candidate restricts the shortcut to
string-only inputs and keeps the original generic byte decoder.

Each raw file records three fresh processes per variant, reversed order in the
middle round, 300 ms warmup and 300 ms measurement per input/mode/consumer.
Consumers are result length and a checksum reading every UTF-16 code unit.
Realistic requests have repeated and 32-variant modes. Four original short
inputs are repeated only; npm 4.0.3 is an unranked reference for those four.
Input hashes and executed core hashes are recorded. No whole-input result cache
is used. A canceled Bun/cl100k run is excluded.

`measured.patch` applies to `9e1420c` and reproduces the measured production
change. Its live prototype-iterator comparison also missed globally replaced
iterator factories; the subsequent candidate captures intrinsic `values`
functions and tests custom factories and prototype replacement. Do not adopt
the rejected patch.

To reproduce, use an isolated checkout of `9e1420c`, apply the patch, and build
through the shared queue. Preserve a separate unmodified baseline build at
`BASELINE/esm`. From the experiment worktree, run this archived probe through
the queue with `TINY_PARENT_BENCH` pointing to the populated benchmark directory:

```sh
python3 /absolute/path/to/benchmark/queue.py --label rejected-tiny \
  env TINY_PARENT_BENCH=/absolute/path/to/benchmark \
  /absolute/node26.12.0 benchmark/experiments/rejected/tiny-indexed/probe.mjs \
  driver /absolute/node26.12.0 cl100k_base /tmp/new-rejected-result.json BASELINE
```

Repeat with `o200k_base` and Bun 1.4.3 as needed. The probe's imports were adjusted
for its archived location; its measurement loop is unchanged.
