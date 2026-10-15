# Scoped legacy benchmark results

node 26.12.0; benchmark-vm; linux/x64; kernel 7.0.0-34-generic. 8 vCPUs; 13th Gen Intel(R) Core(TM) i7-1360P; 15.543449401855469 GiB RAM

Exactly five fresh processes per tokenizer/encoding. Values are median [minimum, maximum]; lower is better. Ranks follow medians; overlapping ranges do not establish a distinct winner. The npm package is an unranked historical reference. Timed correctness mismatches are shown but excluded from every ranking.

These are API-return timings: the checksum reads output length, so decoded strings can remain lazy ropes. Decode plus a complete character read is a separate diagnostic, not included in these ranks.

Eligibility means the seven timed inputs match. Additional probe flags here cover only the five original probes in this raw file; expanded Unicode/casefold probes in the realistic reports expose further mismatches, including the npm reference and Golia. See the optimized interpretation for the complete limitations.

**The seven-input arithmetic mean is dominated by synthetic LatinRepeat and UnicodeRandom. It is a legacy compatibility score, not a realistic-workload or universal winner claim.** Inspect every input below and the separately published realistic categories/modes.

Warmup: ≥500 ms and ≥5 calls per operation; measurement: ≥500 ms and ≥5 calls. Default caches and repeated inputs; load excludes process startup. Filesystem caches are warm; CPU affinity/frequency are uncontrolled on the VM.

## Evidence and selected scope

- Timing SHA-256: `831ddbbd105e23712e815069e6919d35ac4872371456013e82b2c6f0abd4deec`
- Source commit: `c69fba65cac2a6ce8bcac3e2e88b204a1a51e054`; tracked diff SHA-256: `3586b4d4d7a0db7385b070473b0056188bfc6231cfdadcc2100eae10f97ae07d`
- Executed-build manifest SHA-256 (canonical JSON, sorted keys): `234366c4ce34cd74c1ea94d30a2147b029d47ff141437767c75da49f018fd9e1`
- Core module SHA-256: `cc7036d186ecc6eda5df557fdd2ae62bb0f96150081e7044169a52b66ed16f7f`; GptEncoding SHA-256: `748725e53a4a3c4c8ea3cfe68adea19309d748f0be592cf85d611aa3ada39b21`
- Selected verification cases: `gpt-tokenizer:local/o200k_base`, `gpt-tokenizer:npm/o200k_base`

Settled memory was not supplied for this timing/build. No footprint ranks are inferred from transient timing-worker snapshots.

## o200k_base

### Legacy seven-input mean latency (ms/call)

| Tokenizer | Version | Status | Encode | Decode | Count |
|---|---|---|---:|---:|---:|
| gpt-tokenizer:local | local | eligible | 4.261641 [4.243660, 4.601643]; #1/1 | 0.418579 [0.383387, 0.459032]; #1/1 | 3.605497 [3.415008, 3.700040]; #1/1 |
| gpt-tokenizer:npm | 4.0.3 | reference | 7.221554 [6.922476, 7.656277]; unranked | 8.445106 [7.390255, 8.824386]; unranked | 6.572369 [6.143033, 7.038793]; unranked |

### Initialization

| Tokenizer | Load ms |
|---|---:|
| gpt-tokenizer:local | 119.775 [103.224, 132.855]; #1/1 |
| gpt-tokenizer:npm | 105.110 [98.202, 111.452]; unranked |

### Per-input latency (ms/call)

#### English — encode #1/1, decode #1/1, count #1/1

| Tokenizer | Encode | Decode | Count |
|---|---:|---:|---:|
| gpt-tokenizer:local | 0.000725 [0.000670, 0.000764]; #1/1 | 0.000080 [0.000075, 0.000083]; #1/1 | 0.000717 [0.000701, 0.000815]; #1/1 |
| gpt-tokenizer:npm | 0.001583 [0.001533, 0.001782]; unranked | 0.000061 [0.000059, 0.000071]; unranked | 0.001605 [0.001565, 0.001742]; unranked |
#### Chinese — encode #1/1, decode #1/1, count #1/1

| Tokenizer | Encode | Decode | Count |
|---|---:|---:|---:|
| gpt-tokenizer:local | 0.000631 [0.000575, 0.000658]; #1/1 | 0.000191 [0.000173, 0.000209]; #1/1 | 0.000580 [0.000566, 0.000607]; #1/1 |
| gpt-tokenizer:npm | 0.001375 [0.001349, 0.001542]; unranked | 0.003223 [0.003076, 0.003396]; unranked | 0.001301 [0.001260, 0.001380]; unranked |
#### French — encode #1/1, decode #1/1, count #1/1

| Tokenizer | Encode | Decode | Count |
|---|---:|---:|---:|
| gpt-tokenizer:local | 0.000848 [0.000804, 0.000859]; #1/1 | 0.000138 [0.000129, 0.000140]; #1/1 | 0.000801 [0.000761, 0.000841]; #1/1 |
| gpt-tokenizer:npm | 0.001855 [0.001819, 0.001975]; unranked | 0.000109 [0.000107, 0.000124]; unranked | 0.001852 [0.001745, 0.002010]; unranked |
#### Code — encode #1/1, decode #1/1, count #1/1

| Tokenizer | Encode | Decode | Count |
|---|---:|---:|---:|
| gpt-tokenizer:local | 0.001242 [0.001178, 0.001366]; #1/1 | 0.000154 [0.000147, 0.000155]; #1/1 | 0.001186 [0.001118, 0.001289]; #1/1 |
| gpt-tokenizer:npm | 0.002385 [0.002343, 0.002602]; unranked | 0.000130 [0.000126, 0.000136]; unranked | 0.002349 [0.002174, 0.002519]; unranked |
#### Latin — encode #1/1, decode #1/1, count #1/1

| Tokenizer | Encode | Decode | Count |
|---|---:|---:|---:|
| gpt-tokenizer:local | 0.004350 [0.004180, 0.004704]; #1/1 | 0.000664 [0.000626, 0.000699]; #1/1 | 0.004064 [0.003985, 0.004253]; #1/1 |
| gpt-tokenizer:npm | 0.008532 [0.008128, 0.008819]; unranked | 0.000566 [0.000516, 0.000609]; unranked | 0.007947 [0.007725, 0.008598]; unranked |
#### LatinRepeat — encode #1/1, decode #1/1, count #1/1

| Tokenizer | Encode | Decode | Count |
|---|---:|---:|---:|
| gpt-tokenizer:local | 10.073788 [9.634324, 12.254833]; #1/1 | 1.306422 [1.173781, 1.390199]; #1/1 | 8.835604 [8.582706, 9.535492]; #1/1 |
| gpt-tokenizer:npm | 15.684959 [14.732583, 17.910367]; unranked | 1.435590 [1.355220, 1.502159]; unranked | 14.396352 [13.572264, 16.254577]; unranked |
#### UnicodeRandom — encode #1/1, decode #1/1, count #1/1

| Tokenizer | Encode | Decode | Count |
|---|---:|---:|---:|
| gpt-tokenizer:local | 20.054646 [19.371753, 20.969429]; #1/1 | 1.586717 [1.508702, 1.821776]; #1/1 | 15.782849 [15.061842, 17.310095]; #1/1 |
| gpt-tokenizer:npm | 34.003821 [33.660233, 36.990572]; unranked | 57.680509 [50.225413, 60.301848]; unranked | 31.439635 [28.998401, 33.447971]; unranked |

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
