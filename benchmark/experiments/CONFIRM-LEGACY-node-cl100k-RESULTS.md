# Scoped legacy benchmark results

node 26.12.0; benchmark-vm; linux/x64; kernel 7.0.0-34-generic. 8 vCPUs; 13th Gen Intel(R) Core(TM) i7-1360P; 15.543449401855469 GiB RAM

Exactly five fresh processes per tokenizer/encoding. Values are median [minimum, maximum]; lower is better. Ranks follow medians; overlapping ranges do not establish a distinct winner. The npm package is an unranked historical reference. Timed correctness mismatches are shown but excluded from every ranking.

These are API-return timings: the checksum reads output length, so decoded strings can remain lazy ropes. Decode plus a complete character read is a separate diagnostic, not included in these ranks.

Eligibility means the seven timed inputs match. Additional probe flags here cover only the five original probes in this raw file; expanded Unicode/casefold probes in the realistic reports expose further mismatches, including the npm reference and Golia. See the optimized interpretation for the complete limitations.

**The seven-input arithmetic mean is dominated by synthetic LatinRepeat and UnicodeRandom. It is a legacy compatibility score, not a realistic-workload or universal winner claim.** Inspect every input below and the separately published realistic categories/modes.

Warmup: ≥500 ms and ≥5 calls per operation; measurement: ≥500 ms and ≥5 calls. Default caches and repeated inputs; load excludes process startup. Filesystem caches are warm; CPU affinity/frequency are uncontrolled on the VM.

## Evidence and selected scope

- Timing SHA-256: `d8443750904b5fbf69d19be9ce5e885ce503ced6c73bf20b91d4f16e3c011a70`
- Source commit: `c69fba65cac2a6ce8bcac3e2e88b204a1a51e054`; tracked diff SHA-256: `98288f2eca76b4fae93b6ecaa5d57a8904d0e9090011f094bf19509a7a6a4c96`
- Executed-build manifest SHA-256 (canonical JSON, sorted keys): `234366c4ce34cd74c1ea94d30a2147b029d47ff141437767c75da49f018fd9e1`
- Core module SHA-256: `cc7036d186ecc6eda5df557fdd2ae62bb0f96150081e7044169a52b66ed16f7f`; GptEncoding SHA-256: `748725e53a4a3c4c8ea3cfe68adea19309d748f0be592cf85d611aa3ada39b21`
- Selected verification cases: `gpt-tokenizer:local/cl100k_base`, `gpt-tokenizer:npm/cl100k_base`

Settled memory was not supplied for this timing/build. No footprint ranks are inferred from transient timing-worker snapshots.

## cl100k_base

### Legacy seven-input mean latency (ms/call)

| Tokenizer | Version | Status | Encode | Decode | Count |
|---|---|---|---:|---:|---:|
| gpt-tokenizer:local | local | eligible | 3.280117 [3.244968, 3.458724]; #1/1 | 0.367611 [0.357815, 0.369598]; #1/1 | 2.596385 [2.513156, 2.920755]; #1/1 |
| gpt-tokenizer:npm | 4.0.3 | reference | 5.634036 [5.571000, 6.012771]; unranked | 7.092764 [6.863504, 7.348680]; unranked | 4.660512 [4.568963, 4.870503]; unranked |

### Initialization

| Tokenizer | Load ms |
|---|---:|
| gpt-tokenizer:local | 53.857 [50.178, 77.552]; #1/1 |
| gpt-tokenizer:npm | 48.811 [48.337, 52.180]; unranked |

### Per-input latency (ms/call)

#### English — encode #1/1, decode #1/1, count #1/1

| Tokenizer | Encode | Decode | Count |
|---|---:|---:|---:|
| gpt-tokenizer:local | 0.000644 [0.000634, 0.000665]; #1/1 | 0.000071 [0.000068, 0.000074]; #1/1 | 0.000634 [0.000607, 0.000653]; #1/1 |
| gpt-tokenizer:npm | 0.001163 [0.001108, 0.001243]; unranked | 0.000059 [0.000054, 0.000063]; unranked | 0.001194 [0.001148, 0.001251]; unranked |
#### Chinese — encode #1/1, decode #1/1, count #1/1

| Tokenizer | Encode | Decode | Count |
|---|---:|---:|---:|
| gpt-tokenizer:local | 0.000494 [0.000484, 0.000520]; #1/1 | 0.001887 [0.001871, 0.001931]; #1/1 | 0.000439 [0.000429, 0.000457]; #1/1 |
| gpt-tokenizer:npm | 0.000912 [0.000874, 0.000950]; unranked | 0.006286 [0.006095, 0.006629]; unranked | 0.000819 [0.000787, 0.000821]; unranked |
#### French — encode #1/1, decode #1/1, count #1/1

| Tokenizer | Encode | Decode | Count |
|---|---:|---:|---:|
| gpt-tokenizer:local | 0.000763 [0.000744, 0.000856]; #1/1 | 0.000145 [0.000144, 0.000150]; #1/1 | 0.000694 [0.000678, 0.000725]; #1/1 |
| gpt-tokenizer:npm | 0.001684 [0.001636, 0.001688]; unranked | 0.000125 [0.000122, 0.000128]; unranked | 0.001572 [0.001533, 0.001643]; unranked |
#### Code — encode #1/1, decode #1/1, count #1/1

| Tokenizer | Encode | Decode | Count |
|---|---:|---:|---:|
| gpt-tokenizer:local | 0.001056 [0.001015, 0.001082]; #1/1 | 0.000152 [0.000147, 0.000159]; #1/1 | 0.000971 [0.000952, 0.001030]; #1/1 |
| gpt-tokenizer:npm | 0.001819 [0.001801, 0.002038]; unranked | 0.000121 [0.000119, 0.000134]; unranked | 0.001780 [0.001741, 0.001883]; unranked |
#### Latin — encode #1/1, decode #1/1, count #1/1

| Tokenizer | Encode | Decode | Count |
|---|---:|---:|---:|
| gpt-tokenizer:local | 0.004020 [0.003878, 0.004328]; #1/1 | 0.000656 [0.000637, 0.000687]; #1/1 | 0.003683 [0.003536, 0.003761]; #1/1 |
| gpt-tokenizer:npm | 0.007686 [0.007355, 0.007776]; unranked | 0.000536 [0.000527, 0.000566]; unranked | 0.007077 [0.006713, 0.007179]; unranked |
#### LatinRepeat — encode #1/1, decode #1/1, count #1/1

| Tokenizer | Encode | Decode | Count |
|---|---:|---:|---:|
| gpt-tokenizer:local | 9.100331 [8.874266, 9.465183]; #1/1 | 0.978486 [0.969409, 1.004277]; #1/1 | 7.838715 [7.652329, 8.533698]; #1/1 |
| gpt-tokenizer:npm | 14.684979 [14.360883, 14.837714]; unranked | 1.096829 [1.082324, 1.120478]; unranked | 12.947570 [12.610338, 13.724866]; unranked |
#### UnicodeRandom — encode #1/1, decode #1/1, count #1/1

| Tokenizer | Encode | Decode | Count |
|---|---:|---:|---:|
| gpt-tokenizer:local | 13.657300 [13.497308, 15.310208]; #1/1 | 1.576709 [1.532371, 1.609797]; #1/1 | 10.101337 [9.925853, 12.626206]; #1/1 |
| gpt-tokenizer:npm | 25.064215 [24.299749, 27.391099]; unranked | 48.545387 [46.916975, 50.338017]; unranked | 19.598286 [19.360041, 20.355988]; unranked |

## Correctness mismatches

No timed-input or additional-probe mismatches were recorded.

## Input provenance

| Input | Timed | UTF-8 bytes | SHA-256 |
|---|---|---:|---|
| English | True | 44 | `ef537f25c895bfa782526529a9b63d97aa631564d5d789c2b765448c8635fb6c` |
| Chinese | True | 36 | `73e8fc331751af46aa8f690bf5e6ee5fcea46ce1608c77352e44b14db45aecd9` |
| French | True | 58 | `0f7da063db4d9ed52d77a57dd253ba0ff7239ae815f4f4372453c5ad422aa435` |
| Code | True | 68 | `19fe498d9585a6f125ad294203e8a68365c217ffb7e7faa4b57c0176d5c8b214` |
| Latin | True | 400 | `29ac811ff96cbf6d0b6ee7bd6c6130035df43bbfb62e0f86690862f028a2f9b9` |
| LatinRepeat | True | 800000 | `74b8cf1816add23ae12d9113505bf5b9119e23ecb9edada76ec57a0ad51da9a0` |
| UnicodeRandom | True | 316539 | `c6811d447c600ddc4a59dd4cfb54deb465297aa4d668248183465cb25c52f00c` |
| Empty | False | 0 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| LeadingBOM | False | 8 | `7489ebbcc2a00056ddaaaac190bce473e5c03696ea1bd8ed83cf59a174283862` |
| Whitespace | False | 16 | `e69a9a2b008caa3d5c29b3642fbd0e7ec96005c3ad20960cd9562affee68d866` |
| Contractions | False | 54 | `ada27981ddea95fe371e63204676bc94e6ca248cdd76b9d2b8a6d6af5364d373` |
| LongPiece | False | 1024 | `2edc986847e209b4016e141a6dc8716d3207350f416969382d431539bf292e4a` |
