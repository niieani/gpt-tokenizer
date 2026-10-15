# Optimization investigation

The primary target is Node 26.12.0 with `o200k_base`. Bun 1.4.3 and
`cl100k_base` are regression checks. A rank is always tied to a workload,
operation and engine; the original seven-input arithmetic mean is dominated by
large synthetic inputs and cannot establish a universal winner.

## Accepted changes

- Encoding uses native batched splitting for bounded inputs, one vocabulary/cache
  lookup per warm piece, a short ASCII merge path, a byte-rank index, and a bounded
  FIFO cache. Inputs above 1 MiB of UTF-16 units retain streaming splitting.
- FIFO hits do not update insertion order. A bounded key ring avoids repeatedly
  scanning Map tombstones when the default 100k cache is full. Cache capacity,
  shrink, clear, disable/re-enable and generator behavior have explicit tests.
- Byte-heavy decoding lazily builds compact rank-indexed UTF-8 data and copies
  short tokens with packed word stores. String-heavy arrays retain a small indexed
  loop; complete short UTF-8 code points avoid decoder/buffer allocations.
- Streaming decoders own their state and flush at string boundaries and end of
  input. This fixes replacement-character loss and state leakage between
  interleaved generators for arbitrary token sequences. Yielded encode chunks
  are copied so caller mutation cannot poison the internal cache.
- Unicode categories are pinned to official tiktoken's Unicode 16 semantics.
  Node/Bun currently expose Unicode 17. Rare affected characters use corrected
  category sets; ordinary input uses native patterns. See
  [generation and compatibility](../src/codegen/UNICODE.md). This is a correctness
  fix with measurable initialization and scanning costs, not a free optimization.
- Contraction suffixes include Unicode simple-casefold equivalents, including
  long-s (`ſ`). Omitting it changed o200k token boundaries for `" I'ſa"`.
  The gate now exercises all contraction-case variants beside different prefixes
  and tails, in addition to seeded random Unicode.

The cache policy and lazy decoder tables trade retained memory for throughput.
A default-capacity churn probe found roughly half the eviction time after the
ring change, with approximately 0.88 MiB additional heap. At capacity 128 the same
probe was 2–8% slower. FIFO can also evict a frequently used old piece during
unique-input churn because hits do not refresh its age. These are finite stress
diagnostics, not a sampled request
traffic distribution. Final settled-memory measurements must exercise the large
byte-heavy path as well as ordinary text.

## Why the remaining competitor gap matters

Golia 4.1.2 does not simply cache complete benchmark inputs. Its published
[WASM bindings](https://github.com/goliajp/rust-tiktoken/tree/v4.1.2/tiktoken-wasm)
call Rust for each input. Its implementation has:

- a [4,096-slot direct-mapped piece cache](https://github.com/goliajp/rust-tiktoken/blob/v4.1.2/tiktoken/src/piece_cache.rs),
  with exact short keys, token IDs and stored counts;
- a [handwritten ASCII/CJK scanner](https://github.com/goliajp/rust-tiktoken/blob/v4.1.2/tiktoken/src/pretokenize.rs),
  conservative regex fallback and borrowed byte ranges;
- [direct one/two-byte and inline short-key vocabulary lookup](https://github.com/goliajp/rust-tiktoken/blob/v4.1.2/tiktoken/src/vocab.rs);
- [stack scratch for short merges](https://github.com/goliajp/rust-tiktoken/blob/v4.1.2/tiktoken/src/merge.rs)
  and a count path that need not allocate token IDs.

These mechanisms plausibly explain its advantage on ordinary warm text; that is
an inference from source and timings, not a profile proving one dominant cause.
The public API also differs: gpt-tokenizer checks forbidden special tokens by
default, while Golia's ordinary encode treats them literally. Benchmark inputs
match, but the operations perform somewhat different validation work.

A fused ASCII scanner with direct lookup/emission was tested and rejected.
The [preserved rejected experiment](experiments/rejected/ascii/README.md)
records the source, raw measurements and validation. Despite passing exhaustive ASCII-pair and seeded mixed-boundary correctness
checks, it was approximately 2.4–2.6× slower on short realistic encode/count
cases in opposite-order paired probes. Native `String.match` remains the better
JS implementation here. Rust's scanner advantage does not translate directly
to JavaScript branches. A dedicated count path that avoids output IDs on cold
pieces remains a separate profiling direction.
Short-byte direct tables and bounded scratch reuse merit profiling for cold or
multilingual merges. Rust's 64-bit tricks should not be translated into JS BigInt
without measurements. Whole-input result caching would answer a different
workload question and is not used by this candidate.

## Further optimization directions

These are proposals, not measured improvements:

- **Flat decoded output for long text.** The current string-heavy path can return
  a rope cheaply. The separate decode-and-read benchmark exposes its eventual
  traversal/flattening cost, where native/WASM decoders often lead. Profile a
  length-dependent join or a packed UTF-8 destination for string-heavy tokens,
  charging both API-return time and reading every output character. Preserve the
  fast small-output path and malformed UTF-8/generator behavior. The existing
  packed path targets byte-heavy arrays, so it does not solve this general case.
- **Keep tiny indexed decoding small.** Arrays below 128 tokens still use the
  generic iterable method with byte-state bookkeeping. An isolated indexed loop
  may recover the tiny ASCII cl100k losses without changing the generic API.
  Changed dispatch or JIT inlining is a plausible cause, not an attribution
  established by a CPU profile; include both absolute and relative timings.
- **Dedicated cold count processing.** Avoid constructing token arrays when the
  caller only needs a count, borrowing Golia's separation of cached IDs and
  cached counts. First profile allocations and merge cost with the cache disabled
  and with unique request variants; the present warm working set can hide both.
- **Direct short-piece lookup.** Explore compact two-byte tables or bounded
  scratch storage for cold short merges, following Golia's vocabulary and merge
  design. Measure retained memory and initialization as well as throughput; a
  large eager table can erase a useful load-time advantage.
- **Cache workload specialization.** Compare the bounded FIFO with a small
  direct-mapped front cache and a scan-resistant policy on a finite, explicitly
  described mixed-frequency trace. Include small capacities and adversarial
  collisions. The accepted default-capacity win is not evidence that FIFO wins
  every hit distribution.
- **Profile engine-specific costs.** Attribute special-token scanning, Unicode
  compatibility dispatch, piece lookup and merges separately on Node. Keep the
  public default's validation semantics intact. A Rust scanner translated into
  JS was already slower; another scanner needs a different concrete hypothesis.
- **Optional native/WASM prototype.** If the target becomes leading ordinary
  long-document throughput as well, compare a native scanner/merge backend with
  the pure JS implementation behind the same public semantics. This is a larger
  bundle, initialization and distribution tradeoff, not an implemented shortcut
  or a demonstrated win. Keep the JS fallback and correct Unicode/special-token
  behavior; adopting a competitor's backend would also inherit its mismatches
  unless those are fixed.

A proposed change should improve the named realistic category or cold workload,
pass both engines and encodings, and retain separate memory/load and full-output
checks. Reclaiming a synthetic arithmetic-mean rank alone is insufficient
evidence for adopting further complexity.

## Measurement safeguards

All worktrees share a FIFO machine lease, including builds/tests. The lease waits
for the complete command process group and reaps orphaned workers before the
next job. Each timed comparison uses fresh processes, rotated scheduling,
recorded warmup/call budgets, exact runtime checks and built-module hashes.
Correctness precedes timing and checks every input against independent tiktoken.
The additional seeded gate covers arbitrary valid-ID sequences, streaming and
async decoding, interleaved generators, malformed UTF-8 boundaries, special-token
options, cache transitions, long pieces, lone surrogates and Unicode categories.
Official Python fixtures anchor the Unicode-version fix independently of npm.

Realistic reports keep short prose/code/structured/multilingual and real long
repository documents separate. Repeated input and 32 warmed request variants are
separate modes. Neither mode measures an unlimited unique-input stream. The npm
release is an unranked reference. Median ranks with overlapping process ranges
remain uncertain; no grand mean across categories is reported.
