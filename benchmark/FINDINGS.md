# Historical pre-optimization interpretation

This document interprets the immutable [initial refresh](RESULTS.md), measured
before the optimization commits. Its ranks and implementation descriptions do
not describe the optimized checkout. See [the optimized comparison](OPTIMIZED-RESULTS.md)
and [optimization tradeoffs](OPTIMIZATIONS.md) for the subsequent measurements.

## Interpretation

The checkout is not the fastest entry in every case. On Node, it ranks third for
mean encode and count latency in both encodings, behind `ai-tokenizer` and
`bpe-lite`. Its decode ranks are seventh (`cl100k_base`) and sixth (`o200k_base`),
while it ranks first for module load/construction.
Ranks exclude the npm gpt-tokenizer reference and are based on sample medians,
not statistical significance; overlapping ranges warrant caution.

On Bun, encode/count rank fourth for `cl100k_base` and third for `o200k_base`;
decode ranks sixth/fifth and load ranks fourth/sixth. `bpe-lite` wins the mean
encode and count cases on Bun. Golia wins mean decode in all four engine/encoding
combinations: roughly 6–10 times faster than the checkout here. Bun does not
uniformly improve every operation: its checkout decode is faster than Node's,
but encode and loading are slower on these inputs.

Initialization and working memory tell different stories. The checkout's settled
initialization RSS ranks first on Node and Bun `o200k_base`, and second on Bun
`cl100k_base`. Final one-pass RSS ranks fourth/third on Node and sixth/fourth on
Bun; one-pass peak ranks fourth/third on both engines. Retained heap _growth_ is
largest on Node, but that delta is not total live heap. The tables show both
absolute final memory and growth, with native/WASM RSS alongside JS heap.

The independent audit fixed lazy corpus materialization, temporary async/native
loader roots, adapter BOM handling, and publication checks that could accept
missing correctness records or smoke data. Settled-memory snapshots now unwind
loader/output roots before GC in their own five-process phase. One-pass memory
and its peak are distinct from timed-loop allocation/JIT pressure; both peaks
are preserved. Neither retained growth nor peak demonstrates a memory leak.

Run spread matters. Checkout encode has a full min–max spread of about 31% on
Node `cl100k_base`, 2% on Node `o200k_base`, and 8%/10% on Bun. Some memory and
loading ranges are wider still. Five fresh-process samples expose this variation;
close ordinal ranks should be treated as uncertain, not statistically proven
wins. These are repeated-input, default-cache measurements dominated by the two
large synthetic inputs, rather than general unique-document throughput.

Plausible causes, not profiling conclusions: `bpe-lite` keeps an unbounded
per-chunk Map cache, avoiding LRU maintenance; `ai-tokenizer` uses a FIFO merge
cache. These can favor warm repeated inputs relative to the checkout's bounded
LRU. Native/WASM decoders assemble bytes with less JS per-token work, while the
checkout's `decodeNative` grows temporary byte buffers for consecutive byte
fragments. Full HF tokenization pipelines and native HF's public async API also
perform work beyond raw BPE IDs.

The Golia WASM build is fast on many short/Latin cases but has a severe
`o200k_base` random-Unicode slowdown. Its more complex Unicode pre-tokenization
path is a plausible cause; this suite does not isolate regex cost from merge
cost. The per-input tables make this visible rather than attributing it to every
workload.

The local build and npm 4.0.3 have byte-identical `BytePairEncodingCore.js` and
`GptEncoding.js`. Differences between those reference rows should therefore be
read as measurement/build-loading variation, not an identified algorithm
regression. The 2024 charts lack raw samples and environment metadata, so this
refresh cannot establish a quantitative historical regression.

All seven timed inputs match token IDs, decode, and count on both engines. Extra
probes expose `js-tiktoken` dropping a leading BOM during decode; `ai-tokenizer`
dropping U+FEFF during encoding/counting (one token instead of two in the leading
BOM probe; nine instead of ten in the whitespace probe); and HF JS/LenML rejecting
an empty token array during decode. These limitations are explicitly marked in
the tables. The WASM tiktoken adapter preserves BOM bytes through
`TextDecoder({ ignoreBOM: true })`; that adapter correction is not attributed to
the competitor.
