# Rejected unconditional unified-record lookup

**Do not land source commit `c95d3a73e3a86051a861cff1b56daca451be594b` unconditionally.** Replacing the shared vocabulary/piece `Map` with one null-prototype record improves realistic Node throughput, but slows sustained Bun cache churn. That violates the Bun regression constraint. No duplicate vocabulary or whole-input cache is introduced.

The candidate passed build, formatting, type/lint checks, all 4,051 project tests, and existing full correctness gates on Node 26.12.0 and Bun 1.4.3. Every measured document/stream variant and all 500,000 synthetic churn pieces matched the independent tiktoken 1.0.22 oracle. Separate boundary-probe mismatches in competitors remain visible in [REPORT.md](REPORT.md); they do not affect this candidate's correctness.

## What the finite experiments establish

- [Pilot](pilot.json): two opposite-order realistic pairs across both engines/encodings. Node/o200k initially showed a short-support encode regression (ratios 0.935/0.915). Preserve this directional evidence alongside later runs.
- [Realistic confirmation](realistic.json): five fresh processes per entry, 100 ms warmup/300 ms measurement, 15 documents, repeated/32-variant stream modes, encode/count. Frozen 9e1420c and npm 4.0.3 are unranked references. Candidate beats ai-tokenizer 1.0.7 and bpe-lite 0.5.2 in all 28 descriptive category/mode/operation cells; Golia 4.1.2 WASM wins all 28 overall cells. This is scoped evidence, not a universal leadership claim.
- [Longer guards](guards.json): five opposite-order pairs, 500 ms warmup/500 ms measurement on support/European/README. Support medians favor record (encode 1.189 repeated/1.118 stream; count 1.109/1.132), though earlier short-budget spreads must not be discarded.
- [Original seven](legacy.json): five opposite-order pairs, 100/300 ms, encode/count. Arithmetic-mean score stays essentially flat: paired median encode 1.004 [0.953, 1.039], count 0.990 [0.942, 1.102]. UnicodeRandom regresses (encode 0.942, count 0.929 median) while LatinRepeat improves (1.164/1.117). Do not substitute a geometric mean of speedups for the original arithmetic score, or pool this run with realistic measurements.
- [Sustained churn](churn.json): two opposite-order pairs per engine; 100,000 capacity, 100,000 unique fill plus four 100,000 unique churn cycles. Node gains early and approaches parity late. Bun's later-cycle encode ratios are roughly 0.82–0.92 despite lower retained heap. Node/cl100k churn was not measured; Node/cl100k has directional realistic evidence and correctness gates only.

Ratios are frozen/candidate latency; >1 favors record. The complete per-document process ranges and reference values are in [REPORT.md](REPORT.md), with separate original-score, 500 ms guard and phase/peak-memory tables in [DIAGNOSTICS.md](DIAGNOSTICS.md). No losing cases are removed. The raw results are complete, but these are separate scoped experiments, not one pooled ranking.

## Resource and mechanism limits

Across five primary processes, settled fresh initialization heap grows 23.55→28.56 MiB and RSS 112.38→120.23 MiB; median import/initialization grows 113.00→128.23 ms (+13.5%). Under long churn, the record retains less memory than the Map after its capacity growth. Both phases matter; neither is a universal footprint claim.

The storage substitution is the observed intervention. Faster property lookup is plausible for warm ordinary pieces; string internalization/hashing may explain UnicodeRandom's loss, and JSC dictionary deletion/rehash may explain Bun churn. These are hypotheses, not isolated profiler findings. The earlier count profile includes native matching inside the Unicode wrapper; it does not attribute all regex time to the Unicode guard.

An engine-selected Node record/Bun+browser Map implementation is a separate integration candidate requiring fresh measurements. The unconditional source here remains rejected.

## Provenance and reproduction

The candidate patch targets 9e1420c and is preserved in [candidate.patch](candidate.patch). Baseline compiled core SHA256 is `cc7036d186ecc6eda5df557fdd2ae62bb0f96150081e7044169a52b66ed16f7f`; candidate core is `3395763a64605fc7ebbda4fab58bded43eb737432df2668934b9511d4e8b7c95`. Full executed module and harness hashes are in raw metadata.

Realistic inputs are historical corpus v2, before the privacy fixture revision. Input/build/harness hashes remain truthful; private snapshot bytes are not re-published here. Corpus JSON SHA256 is `2a3a4eb1b0b9fc382f0a616157cae01fb95a74cf727ba7427a8576141fcd0542`; materialized document+stream JSON digest is recorded in the pilot. A run using the replacement corpus must have a new label and must not be pooled with these results.

The archived [run.mjs](run.mjs), [worker.mjs](worker.mjs), [protocol.mjs](protocol.mjs), pilot/legacy/guard/churn probes preserve their exact original script bytes. They retain original local paths/output names; reconstruct the historical builds/fixtures and adapt paths for another machine. The custom runner supports `--frozen-baseline` and a separately unranked npm entry. Never run its data through the canonical npm-baseline ranking report. The churn generator deterministically creates the corpus and tiktoken binary oracle, whose SHA256 values are recorded; large generated input/oracle files are not committed.

Raw metadata was processed with `benchmark/anonymize.py`; measurements and original input/build/harness digests are unchanged. Its `publicationPrivacy` field preserves original raw-file digests. The explicit machine label is `benchmark-vm`; original private labels are absent.

Regenerate the scoped tables after changing their owning scripts or raw inputs:

```sh
python3 benchmark/experiments/rejected/round-two-record/report.py benchmark/experiments/rejected/round-two-record/realistic.json benchmark/experiments/rejected/round-two-record/REPORT.md
python3 benchmark/experiments/rejected/round-two-record/diagnostics.py
```

All builds/tests/performance jobs used the shared FIFO queue. Timing runs: pilot141, primary realistic154, original-seven157, churn158, longer guards160. All workers completed and leases were released. No additional unconditional-record experiment is pending.
