# Rejected native ASCII regex specialization

Rejected: no meaningful Node/o200k improvement and Bun regressions. The candidate selects an ASCII-category native regex after a non-ASCII guard; Unicode inputs retain the existing canonical dispatcher. It retains native global batching and does not cache whole inputs.

Baseline: `9e1420c`. Exact Node26.12.0 and Bun1.4.3; fresh processes, opposite pair orders, repeated realistic encode/count, 100ms warmup and measurement per document/operation. Node/o200k has three pairs; informational combinations have two. This is exploratory evidence, not publication ranking.

| Engine | Encoding | Encode speed ratio | Count speed ratio |
| --- | --- | ---: | ---: |
| 1.4.3 | cl100k_base | 0.926 | 0.923 |
| 1.4.3 | o200k_base | 0.889 | 0.935 |
| Node26.12.0 | cl100k_base | 1.055 | 0.999 |
| Node26.12.0 | o200k_base | 0.995 | 1.028 |

Ratios are baseline/candidate latency, geometric means equally weighting documents and process pairs; >1 favors the candidate. Raw data retains every per-document sample and spread. For example, Node/o200k prose encode category ratios were 0.779/0.956/1.061, demonstrating substantial process spread rather than a stable short-input win.

Correctness: full existing oracle gates passed on both engines, including Unicode16/long-s probes. The later project check stopped at no-control-regex lint on the intentional ASCII guard; the added differential tests were not run. No production source commit.

Corpus: current version at baseline9e1420c, before the privacy fixture revision. Its immutable document JSON digest is `c1ffcce2675cd9253414684f31c61bf30350b1c392d809a632e47601166e8519`; these measurements must not be relabeled as the replacement corpus.

Artifacts: [raw](results.json), [candidate patch](candidate.patch), [probe](probe.mjs). The historical probe retains its exact original paths and recorded script hash; adapt paths and reconstruct the baseline/candidate builds to rerun. The patch was saved after formatter-only changes, whereas the raw source hash identifies the exact text compiled for measurement. Compiled hashes are preserved in raw metadata.
