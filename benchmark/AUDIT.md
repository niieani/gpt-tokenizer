# Independent benchmark audit — 2026-10-15 UTC

A separate agent reviewed the harness, adapters, datasets, memory accounting,
aggregation, and publication scripts while the initial measurements ran. It did
not edit files or run competing benchmarks. The initial partial timing run was discarded. Later memory-only corrections
preserve sound throughput/load timings; the separate settled-memory samples
were collected after all memory fixes. Early timing-file memory snapshots remain
as diagnostics and are excluded from settled-memory rankings.

| Finding                                                                                                           | Resolution                                                                                                                                                                                                                                                                        |
| ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Retained memory included deferred corpus-string flattening/release.                                               | Materialize every timed input through a UTF-8 Buffer round trip before baseline GC. Rerun both engines in full.                                                                                                                                                                   |
| Immediate GC still retained temporary corpus buffers and async loader JSON (up to 16.2 MiB for native HF on Bun). | Confirmed with isolated immediate-versus-next-turn diagnostics. Use a separate five-process memory phase with event-loop settlement before baseline, after loading and after released workload outputs. Preserve sound timing samples; distinguish one-pass and timed-loop peaks. |
| tiktoken adapter's TextDecoder could strip a leading U+FEFF.                                                      | Set `ignoreBOM: true` and add a leading-BOM probe. This also exposed a real js-tiktoken decode limitation.                                                                                                                                                                        |
| Empty/missing correctness records could pass `all([])` and receive a rank.                                        | Require exact, unique verification coverage for every declared input and tokenizer/encoding. Add regression tests.                                                                                                                                                                |
| Smoke data could publish under five-run labels; sample validation was incomplete.                                 | Require five rounds, minimum duration/calls, exact rounds, expected engines/versions, matching settings/packages, complete metrics, finite values, and consistent elapsed time.                                                                                                   |
| Charts/interactive text did not handle timed correctness failures consistently.                                   | Flag mismatching chart/table entries, withhold ranks, and derive the interactive correctness statement from eligibility.                                                                                                                                                          |

The auditor found no further blocker in timing aggregation, native output
handling, IPC, or process isolation. It confirmed that count checks still execute
when an adapter rejects empty-input decoding.

Interpretation limits retained in the methodology:

- The two large synthetic inputs overwhelmingly dominate the arithmetic mean;
  inspect per-input tables before applying the ranking to another workload.
- Repeated inputs favor default caches; this is not unique-document throughput.
- Post-GC memory still includes tokenizer caches, JIT state, and allocator behavior;
  peak RSS also includes the harness and corpus. Heap accounting differs by engine.
- Five process samples and min–max ranges do not establish statistical significance
  or prove JIT convergence. Overlapping ranges should be treated cautiously.
- Standard package entrypoints can load more than one encoding. Initialization is
  representative of these adapters, not each library's smallest possible bundle.

Regression checks: `vp run test` in `benchmark/` and `python3 test_report.py`.

A focused runtime follow-up verified the pinned Bun 1.4.3 implementation:
[`globalThis.gc()`](https://github.com/oven-sh/bun/blob/bun-v1.4.3/src/jsc/bindings/ZigGlobalObject.cpp#L3075-L3083)
forces synchronous full collection, and
[`process.resourceUsage().maxRSS`](https://github.com/oven-sh/bun/blob/bun-v1.4.3/src/jsc/bindings/BunProcess.cpp#L3900-L3910)
uses KiB on Linux, matching Node. The MiB conversion is correct. Bun additionally
forces native allocator cleanup during full collection, reinforcing the caveat
about comparing post-GC memory between engines.

Bun's timing runner was paused at worker boundaries for the memory diagnostics
and phase validation. Active measured workers were allowed to finish normally;
none was suspended, and diagnostic processes exited before the sweep resumed.
The raw sweep start/end duration therefore also includes idle audit intervals.

The final independent pass recomputed aggregate statistics, ranks, and per-input
timing medians from all 460 raw samples, and verified raw hashes, source
provenance, correctness findings, and settled-memory separation. Everything
agreed with the publication. Per-input memory is labeled cumulative because
earlier inputs' retained allocations remain live.

## Optimization follow-up audit

A separate agent inspected the combined implementation and measurement protocol
before the final optimized runs. No blocking defect remained by inspection. The
following findings were fixed or made explicit:

| Finding                                                                                               | Resolution                                                                                                                                                                          |
| ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A command launcher could exit before its grandchildren, letting teardown overlap a later measurement. | The queue adopts/reaps Linux orphans, holds the process-group lease, and escalates cancellation; six queue tests include a TERM-ignoring grandchild.                                |
| Candidate decode was called directly while the npm adapter used a forwarding wrapper.                 | Both use the same adapter shape and wrapper.                                                                                                                                        |
| A publication run could request zero warmup.                                                          | Publication validators require recorded warmup budgets and actual calls/duration, and reject exploratory/incomplete runs.                                                           |
| The old arithmetic mean mostly measures two large synthetic strings.                                  | Preserve it as a labelled legacy score; publish realistic categories, modes, per-document losses and ranges separately.                                                             |
| Self-reference and round trips miss matching but noncanonical token boundaries.                       | Add independent npm tiktoken differential checks and 1,171 official Python vectors per encoding; fix Unicode 16/17 boundary drift and omitted Unicode contraction-casefold members. |
| Shared streaming decoder state lost replacement characters or leaked between interleaved generators.  | Give streams private state, flush at string boundaries/EOF, and test arbitrary valid token sequences and truncated bytes.                                                           |
| Yielded encode chunks exposed cached arrays to caller mutation.                                       | Yield copies; verify later encode/count/generator results after mutation.                                                                                                           |
| Fresh Map iterators on each FIFO eviction repeatedly scan tombstones under full-cache churn.          | Use a bounded key ring, with wrap/shrink/clear/generator lifecycle tests and a separate capacity stress probe.                                                                      |
| Lazy decoder tables could be hidden by timing warmup or understated by initialization-only memory.    | Measure matching settled one-pass memory including the large byte-heavy input; retain first-document diagnostics separately.                                                        |
| A single median rank can imply more certainty than the VM supports.                                   | Publish all five process ranges; keep longer confirmation runs separate and treat overlapping ranges as unresolved.                                                                 |

Remaining limits are deliberate and visible. A 32-request warmed stream is not an
unlimited unique-input workload. FIFO hits do not refresh eviction age, so heavy
unique churn can evict frequently used old pieces. Unknown-browser non-ASCII
input uses a slower exact-Unicode fallback; it was correctness-tested but not
measured as a browser application. Unicode compatibility also adds initialization
work. Standard package entrypoints retain their different import/deferred-work
behavior; this is not a comparison of hand-selected minimal builds. VM host
scheduling, turbo, JIT and GC remain outside the queue's control. Invalid numeric
IDs do not have one portable cross-library contract.

The independently reviewed packed word copies have explicit buffer padding and
length bounds; short UTF-8 decoding rejects overlong, surrogate and out-of-range
scalars. Vocabulary lookups exclude cached merged-piece arrays. Unicode dispatch
covers both `match` and `matchAll`, preserves iterator state, and retains no input
strings. Final seeded gates still run after integration; code review alone is not
treated as proof of equivalence.

API-return timings consume result length, so decoded strings may remain lazy ropes. They measure public return latency rather than full text materialization. A separate `--consume full` diagnostic reads every output code unit/token and includes that common consumer cost; its ranks and times must stay separate.
