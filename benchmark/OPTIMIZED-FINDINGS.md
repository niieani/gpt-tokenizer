# Optimized comparison: interpretation

The checkout reaches first place for encode, decode, and count on the original
Node 26.12.0 / o200k_base seven-input mean. It does **not** become the fastest
tokenizer for every realistic request, nor for decode followed by reading the
complete output. Use the [generated tables](OPTIMIZED-RESULTS.md),
[realistic categories](experiments/OVERVIEW.md), and
[decode-and-read results](experiments/CONSUMED-OVERVIEW-RESULTS.md) together.

The legacy means are 3.939 ms encode, 0.369 ms decode API return, and 3.166 ms
count. Relative to the contemporaneous npm 4.0.3 reference, those are about
1.78×, 20.1×, and 1.87× faster. Full process min–max spreads are about 3.3%,
2.2%, and 2.2% of the medians. The two large synthetic inputs dominate this
score; a 20× improvement here is not a 20× improvement on ordinary prose.

The load-time median remains first among competing implementations, but the
checkout and npm reference overlap: 99.05 ms [94.04, 108.24] versus 97.69 ms
[96.10, 101.25]. These primary samples alone do not establish a release
regression or improvement.
Across-session absolute loading times also drifted on the VM; only compare
contemporaneous reference rows.

The later throughput confirmations also record load once per process. Their
medians are higher for the candidate: Node/o200k 119.77 versus 105.11 ms
([103.22, 132.86] versus [98.20, 111.45]), and Node/cl100k 53.86 versus
48.81 ms ([50.18, 77.55] versus [48.34, 52.18]). Ranges overlap and shift
between sessions. Unicode compatibility regex initialization does add work, but
these runs do not isolate its cost from other changes and VM variation. Load
parity is uncertain; the primary median rank is not a promise of free startup.

The separate Node/o200k memory run puts settled initialization RSS first
(45.51 MiB delta), and final/peak process RSS third (168.00/173.33 MiB).
The checkout still has the largest retained JS heap growth among contenders
(7.75 MiB, rank 10/10), though its absolute final heap is fifth (29.55 MiB).
WASM/native entries keep much of their storage outside the JS heap; heap alone
does not compare total footprint. Relative to npm, candidate retained heap is
slightly lower (8.08 → 7.75 MiB), final RSS medians fall from 180.21 to
168.00 MiB, and settled initialization heap rises from 16.00 to 16.11 MiB.
Some RSS process ranges overlap; these are descriptive VM observations.

Within the six tested pure-JS implementations (gpt-tokenizer, js-tiktoken,
@huggingface/tokenizers, bpe-lite, ai-tokenizer and @lenml/tokenizers), the
checkout ranks first for mean encode/decode API-return/count latency and for
absolute final and peak process RSS. Final RSS is 168.00 MiB versus
228.61–263.76 MiB for the other pure-JS entries; peak RSS is 173.33 MiB versus
235.10–290.84 MiB. Their full process ranges are separated from the checkout's
for both RSS metrics. This supports the scoped fastest/lowest-footprint
pure-JS claim on Node 26.12.0 / o200k_base; it does not extend the mean timing
rank to every realistic workload. Package/download/browser bundle sizes were
not measured, so these results do not establish a "smallest" claim.

## Release regressions and informational checks

The [longer Node/o200k confirmation](experiments/CONFIRM-LEGACY-node-o200k-RESULTS.md)
also confirms tiny decode losses versus npm: English 0.080 versus 0.061 µs,
French 0.138 versus 0.109 µs, code 0.154 versus 0.130 µs, and Latin 0.664 versus
0.566 µs. Those are approximately 17–31% slower, with separated process ranges
and deltas of 0.019–0.099 µs. The overall mean improves because Chinese and
random-byte-heavy decode improve by much more; this does not make the small
regressions disappear.

The [longer Node/cl100k confirmation](experiments/CONFIRM-LEGACY-node-cl100k-RESULTS.md)
reproduces tiny string-heavy decode losses against npm: English 0.071 versus
0.059 µs, French 0.145 versus 0.125 µs, code 0.152 versus 0.121 µs, and Latin
0.656 versus 0.536 µs. These are approximately 16–26% slower, with separated
process ranges. The absolute deltas are 0.012–0.120 µs. Larger/byte-heavy decode
improves; this does not erase the small-input regressions. The more complex
generic short-input method and changed JIT inlining are plausible causes.

Bun's original seven-input encode/decode/count means improve approximately
2.0–4.1×, and no individual original timing case loses more than 5% in that run.
Memory is a tradeoff: settled retained heap growth rises from 11.57 to
13.06 MiB for cl100k and 9.57 to 12.23 MiB for o200k. The five-process heap
ranges are separated. cl100k final RSS medians rise from 95.71 to 108.80 MiB,
with overlapping and fairly wide process ranges; o200k final RSS changes from
117.40 to 119.21 MiB, also overlapping. Lazy packed tables and cache storage
interact with JSC's allocation/accounting differently from V8. This explanation
comes from source and needs investigation; it is not a measured allocation
attribution.

The informational realistic runs also improve encode/count in every category,
but do not eliminate short decode losses. The [longer Bun/o200k decode
confirmation](experiments/CONFIRM-REAL-DECODE-OVERVIEW-RESULTS.md) changes category
speedups from an initial 0.93–1.22× npm to 0.96–1.12×; no confirmed category
median is more than 5% slower. Individual European text in stream mode remains
approximately 7% slower (0.096 µs) with separated process ranges. Other
individual median losses remain in the ledger, mostly with overlapping ranges.
These are selected release comparisons, not market ranks.

The longer Bun/cl100k check has category speedups of 0.99–2.04× npm. The
initial structured/code losses do not persist at category level; the remaining
individual losses above 5% are approximately 5–6.5% (0.052–0.079 µs), both
with overlapping process ranges. These longer Bun runs limit what can be
concluded from the first 100 ms comparisons; they do not justify a blanket
claim of zero regressions.

## How to read realistic ranks

The seven categories have separate repeated and bounded 32-variant modes. The
authored short examples are request-shaped, not a sample of real production
traffic. The long inputs are actual pinned repository documents. There is no
cross-category winner score. A selected checkout/Golia chart is an illustration;
the tables retain ai-tokenizer, bpe-lite, and tiktoken as well.

In the complete Node/o200k realistic run, Golia leads encode and count in all
14 category/mode combinations. The candidate improves versus npm in each
category: 1.20–1.78× encode and 1.22–1.84× count. It nevertheless trails Golia
by approximately 1.28–5.54× encode and 1.52–8.99× count. The widest gap is the
long README. Candidate ranks are usually second, but third/fourth on some long
documents. The native scanner, borrowed bytes and dedicated count processing
are credible profiling directions, not proof that one mechanism explains the
whole gap. The ordinary-text #1 target therefore remains unreclaimed.

API-return decode ranks first by median in six of 14 combinations and second
in eight. ai-tokenizer leads those eight; short prose/code/structured candidate
latency is approximately 24–32% higher than ai-tokenizer. Candidate category
speedups versus npm span 0.81–1.17×, with losses concentrated in short text.
Some long-document median leads are very close and not evidence of distinct
performance. The dedicated longer API-return decode confirmation preserves the
same corpus and compares candidate/npm with ai-tokenizer separately.

That [longer API-return decode confirmation](experiments/CONFIRM-REAL-DECODE-OVERVIEW-RESULTS.md)
reproduces the short-category losses: candidate/ai-tokenizer is 1.19–1.33×,
while candidate speedup against npm is 0.81–0.86×. Multilingual remains faster
than ai-tokenizer, and long-document differences are mostly close; some initial
median ranks reverse. The confirmation selects candidate and ai-tokenizer plus
the unranked npm reference, so its ranks do not replace the full shortlist's.

API-return decode consumes length. Decoded strings may remain ropes, making a
cheap return different from cheap traversal. The separate consumed-output metric
reads every UTF-16 code unit and includes that common consumer cost. It changes
rankings and exposes losses against native/WASM entries and, in some cells, npm
4.0.3. Rope construction/traversal and JIT behavior are plausible contributors;
these measurements do not attribute CPU time to either. Longer confirmations
use new five-process samples at 500 ms warmup/measurement, without replacing or
pooling the original observations.

The [longer decode-and-read confirmation](experiments/CONFIRM-CONSUMED-OVERVIEW-RESULTS.md)
leaves the checkout behind the fastest measured contender in 12 of 14
category/mode comparisons. Long-document candidate/leader ratios range from
about 1.10× to 1.25×; close short-category ranks change between runs. Several
short categories also remain slower than npm, with category speedups around
0.87–0.94×. Individual confirmed losses include chat JSON repeated (about 26%,
0.67 µs) and Python stream (about 19%, 0.49 µs). These consumer-inclusive results
are incompatible with a broad claim of decode leadership or no regressions.

## Correctness and scope

All timed inputs and their variants match independent tiktoken IDs, round trips,
and counts. This is not a claim that every library implements identical APIs.
The extra probes disclose the following limitations:

- npm gpt-tokenizer 4.0.3, ai-tokenizer and bpe-lite differ on a Unicode-version
  category boundary and the o200k long-s contraction `" I'ſa"`; the checkout
  fixes both. These mismatches preserve the decoded text while changing IDs
  and counts.
- Golia differs on that long-s contraction despite matching all timed inputs.
- ai-tokenizer drops U+FEFF during encode/count; js-tiktoken loses a leading BOM
  during decode. HF JS and LenML reject decoding an empty token array.

The expanded candidate gate passes 4,984 strings and 350 arbitrary valid-ID
sequences per encoding on both engines, including cache transitions, streaming,
async/interleaved decoding, invalid UTF-8 boundaries, special tokens and output
mutation. Official Python fixtures anchor Unicode category/casefold semantics.
Invalid numeric IDs are a separate API observation, not a portable native-code
test. See the [audit](AUDIT.md) for limits and the fixes to the original suite.

The [historical complete matrix](RESULTS.md) benchmarks every retained contender
on both encodings and engines where supported. The frozen optimization rerun
compares all contenders on Node/o200k, and candidate versus npm on Node/cl100k
and Bun/both encodings. Those selected informational reruns do not establish
current market ranks for the other combinations.

## Long-README count CPU diagnostic

The [unranked profile](results/optimized-canonical-profile-count-node-o200k.json)
samples five seconds per implementation after a one-second warmup on the pinned
README. Counts match independent tiktoken; the build and input hashes match the
published run. This uses one process and profiler overhead, so its call counts
are not a new throughput comparison.

| Entry     | Main sampled leaf frames                           | Sample share |
| --------- | -------------------------------------------------- | -----------: |
| npm 4.0.3 | `countNative`; `getBpeRankFromString`              | 48.6%; 45.4% |
| Checkout  | `StableUnicodeRegExp[Symbol.match]`; `countNative` | 53.5%; 44.8% |
| Golia     | One anonymous WASM function                        |        86.6% |

The checkout's first frame includes the actual native splitting call as well as
the compatibility guard/dispatch. This profile cannot assign 53.5% to the guard
alone, or separate Map lookup from other work in `countNative`. Golia's anonymous
WASM frame cannot identify a Rust mechanism. The largest sample gaps are
34–46 ms on the VM; count-weighted and time-weighted proportions are close in
this diagnostic. It points toward splitting and the warm piece/count loop for
further profiling, rather than claiming that cold BPE merges dominate this
already-warmed README case.

## Tradeoffs and next experiments

The [implementation investigation](OPTIMIZATIONS.md) records accepted changes,
the rejected slower ASCII scanner, source evidence from Golia, and concrete
follow-ups. The FIFO key ring and lazy packed decoder use extra retained storage;
small-cache and unique-churn behavior differs from the warmed publication corpus.
The Unicode compatibility path fixes correctness. Browsers without a trusted
Unicode-version signal use a stable range-based fallback for non-ASCII input;
that can be much slower even in a recent browser. These runs do not measure
browser performance. Neither footprint deltas nor a process peak diagnose a leak.

Prioritize flat long-output decoding, a smaller indexed tiny-decode loop,
dedicated cold counting and compact short-piece lookups. Preserve both consumed
and API-return measurements, load/memory, and correctness gates. Translating a
native scanner into JS was slower here; it should not be adopted just because a
leading Rust implementation uses one.
