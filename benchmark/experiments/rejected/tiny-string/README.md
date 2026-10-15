# Rejected: index a short string prefix, then restart decoding

**Rejected for a real correctness regression. Do not land source commit
`9f612a5`.** This candidate used an indexed string-only loop below 128 tokens,
then restarted the original iterable decoder on the entire array when it found
a raw-byte token. Restarting reads numeric getters and Proxy traps twice.

The minimal fixture has vocabulary `['a', 'b', [0xc3]]` and input `[0, 2]`.
Its index-0 getter returns 0 on its first read and 1 thereafter. Ordinary
single-pass iteration decodes `a�` with one getter read; the candidate decodes
`b�` with two reads. The same failure occurs with a Proxy. The recorded
[reproducer output](accessor-failure.json) matches the exact timed core hash.

`reproduce-accessor.mjs` asserts this known failure. Run it through the queue:

```sh
python3 /absolute/path/to/benchmark/queue.py --label rejected-accessor \
  env TINY_PARENT_BENCH=/absolute/path/to/benchmark \
  /absolute/node26.12.0 \
  benchmark/experiments/rejected/tiny-string/reproduce-accessor.mjs \
  /absolute/candidate/esm/BytePairEncodingCore.js
```

The candidate passed 4,052 unit tests and both engines' expanded gates (4,984
strings plus 350 arbitrary valid-ID sequences per encoding). Those gates missed
accessor-backed arrays. Custom iterator factories, their receiver and single
getter read, and replaced global prototype iterators had focused tests; those
checks did not cover numeric element getters. Passing the gates was insufficient.

## Completed measurements

These are rejected experimental results, not published rankings. Every row uses
fresh processes with alternating variant order and separate result-length/full
UTF-16 checksum consumers. Repeated input and 32 deterministic variants remain
separate modes. The checkout reference is frozen `9e1420c`, not npm 4.0.3.
Inputs use that commit's unchanged pinned v2 fixtures. Ordinary token IDs match
independent tiktoken 1.0.22; the 127-token malformed-byte trace matches a native
UTF-8 byte oracle. No whole-input result cache is used.

| Raw file | Processes per variant | Warmup / measurement per cell | Scope |
|---|---:|---:|---|
| [Node/o200k confirmation](confirm-node-o.json) | 5 | 500 / 500 ms | English, Chinese, three realistic documents, malformed-127; ai-tokenizer 1.0.7 on ordinary inputs |
| [Node/cl100k confirmation](confirm-node-cl.json) | 5 | 500 / 500 ms | English, Chinese, CJK, malformed-127 |
| [Bun/o200k informational](info-bun-o.json) | 5 | 100 / 200 ms | English, Chinese, three realistic documents, CJK, malformed-127 |
| [Bun/cl100k informational](info-bun-cl.json) | 5 | 100 / 200 ms | Same informational inputs |

Node is 26.12.0; Bun is 1.4.3. The [Node/o200k](priority-node-o.json) and
[Node/cl100k](priority-node-cl.json) three-process 300/300 ms probes are retained
as directional history. They are not pooled with confirmations.

Selected Node/o200k repeated-input confirmation results, microseconds per call,
median [minimum, maximum]:

| Input / consumer | Frozen checkout | Rejected candidate | ai-tokenizer |
|---|---:|---:|---:|
| English / length | 0.073 [0.069,0.078] | 0.060 [0.060,0.067] | 0.070 [0.069,0.071] |
| Support / length | 0.453 [0.443,0.466] | 0.318 [0.307,0.328] | 0.378 [0.363,0.394] |
| TypeScript / length | 0.665 [0.619,0.697] | 0.432 [0.428,0.478] | 0.502 [0.486,0.508] |
| JSON / length | 0.592 [0.585,0.685] | 0.404 [0.401,0.409] | 0.458 [0.450,0.467] |
| Support / full read | 2.104 [2.094,2.186] | 1.971 [1.912,2.126] | 2.019 [1.951,2.305] |
| TypeScript / full read | 2.759 [2.329,2.924] | 2.429 [2.294,2.739] | 2.512 [2.260,2.809] |
| JSON / full read | 2.066 [1.835,2.194] | 1.815 [1.627,1.899] | 1.998 [1.887,2.077] |
| Chinese / length | 0.209 [0.203,0.230] | 0.234 [0.224,0.248] | 4.081 [3.837,4.571] |
| Chinese / full read | 0.255 [0.250,0.259] | 0.279 [0.275,0.285] | 4.351 [3.882,4.659] |
| Malformed-127 / length | 27.763 [23.522,31.586] | 30.751 [28.809,33.478] | not run |
| Malformed-127 / full read | 28.575 [27.303,30.722] | 31.198 [29.481,31.951] | not run |

Ordinary API-return gains were real in this confirmation, but neither those
gains nor wins over this one JS competitor establish an all-contender rank.
Full-output gains were smaller, with overlapping ranges on ordinary documents.
There were also performance regressions: Node/o200k Chinese full-read latency
rose 9.4% with separated process ranges. Bun/o200k Chinese API-return latency
rose from 0.163 [0.159,0.172] to 0.187 [0.184,0.190] microseconds, a 14.8%
regression with separated ranges. Bun/cl100k CJK API-return medians rose 20.8%
(2.837 to 3.428 microseconds). Node/cl100k Chinese/CJK/malformed medians remained
within approximately 5% with overlapping ranges. See every mode and spread in
the raw files rather than interpreting these selected rows as universal behavior.

## Reproduction and future direction

Apply `measured.patch` to an isolated checkout of `9e1420c` and build through the
queue. Preserve a second unmodified build as `BASELINE/esm`. Copy the exact
`probe.measured.mjs` to `benchmark/experiments/tiny-indexed-confirm.mjs` in that
worktree: it intentionally retains its original relative imports, and its bytes
match the script SHA-256 recorded in every complete timing file.

```sh
python3 /absolute/path/to/benchmark/queue.py --label rejected-tiny-string \
  env TINY_PARENT_BENCH=/absolute/path/to/benchmark \
  /absolute/node26.12.0 benchmark/experiments/tiny-indexed-confirm.mjs \
  driver /absolute/node26.12.0 o200k_base /tmp/new-result.json BASELINE
```

For the raw-focused cl100k confirmation add
`TINY_SELECT=English,Chinese,cjk,malformed-127 TINY_NO_AI=1` to `env` and select
`cl100k_base`. For informational Bun runs use Bun 1.4.3 as the driver target,
`TINY_SELECT=English,Chinese,support,typescript,api-json,cjk,malformed-127`,
`TINY_NO_AI=1 TINY_WARM_MS=100 TINY_MIN_MS=200`. Default rounds are five;
directional probes used `TINY_ROUNDS=3 TINY_WARM_MS=300 TINY_MIN_MS=300` and their
respective input subsets.

A future implementation could pass the already-read token, accumulated string
prefix and existing iterator into a continuation, avoiding any second read of
input elements. That may also avoid rebuilding discarded prefixes on byte-heavy
text. Its iterator/object and JIT costs are unknown. It was not implemented or
measured in this round, and requires fresh correctness and performance gates.
