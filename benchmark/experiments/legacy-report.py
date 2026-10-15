#!/usr/bin/env python3
"""Report a scoped original-runner timing file, optionally with settled memory.

Usage: python3 legacy-report.py TIMING.json MEMORY.json|- OUTPUT.md
This offline report reads evidence only; it never runs tokenizers or benchmarks.
"""
import hashlib
import json
import math
from pathlib import Path
from statistics import mean, median
import sys

OPS = ('encode', 'decode', 'count')
MEM = {'heapUsed', 'rss', 'external', 'arrayBuffers'}
TIMED = {'English', 'Chinese', 'French', 'Code', 'Latin', 'LatinRepeat', 'UnicodeRandom'}
PROBES = {'Empty', 'LeadingBOM', 'Whitespace', 'Contractions', 'LongPiece'}
ENCODINGS = {'cl100k_base', 'o200k_base'}
LOCAL = 'gpt-tokenizer:local'
REFERENCE = 'gpt-tokenizer:npm'


def require(condition, message):
    if not condition:
        raise ValueError(message)


def integer(value, minimum=None):
    return type(value) is int and (minimum is None or value >= minimum)


def finite(value, minimum=None):
    return type(value) in (int, float) and math.isfinite(value) and (minimum is None or value >= minimum)


def digest(value):
    return isinstance(value, str) and len(value) == 64 and all(c in '0123456789abcdef' for c in value)


def sha256(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def correct(check):
    return (check['firstDifference'] == -1 and check['tokens'] == check['actualTokens']
            and check['roundTrip'] and check['count'] and not check.get('error'))


def build_hashes(build):
    require(isinstance(build, dict) and build, 'Missing executed build hashes')
    require(all(isinstance(k, str) and k.endswith('.js') and digest(v) for k, v in build.items()), 'Invalid executed build hash')
    require({'BytePairEncodingCore.js', 'GptEncoding.js'} <= set(build), 'Missing executed core hashes')


def environment(env):
    require((env['engine'], env['engineVersion']) in {('node', '26.12.0'), ('bun', '1.4.3')}, 'Unexpected engine version')
    for key in ['hostname', 'platform', 'arch', 'kernel', 'executable', 'gitCommit']:
        require(isinstance(env[key], str) and env[key], f'Missing environment {key}')
    require(digest(env['gitDiffSha256']), 'Missing source diff digest')


def validate_timing(run):
    require(type(run['schema']) is int and run['schema'] == 1 and isinstance(run['finishedAt'], str) and run['finishedAt'] and type(run['errors']) is list and not run['errors'], 'Incomplete or failed timing run')
    environment(run['environment'])
    build_hashes(run['candidateBuild'])
    settings = run['settings']
    require(type(settings['rounds']) is int and settings['rounds'] == 5, 'Publication requires exactly five rounds')
    require(finite(settings['minMs'], 300), 'Publication requires >=300 ms measurement')
    require(finite(settings['warmupMs'], 100), 'Publication requires >=100 ms warmup')
    require(integer(settings['warmupMinimumCalls'], 5) and integer(settings['minimumCalls'], 5), 'Insufficient minimum call counts')
    packages = {p['id']: p for p in run['packages']}
    require(len(packages) == len(run['packages']) and packages, 'Duplicate or missing packages')
    for package in packages.values():
        require(isinstance(package['version'], str) and package['version'], 'Missing package version')
        require(package['encodings'] and len(set(package['encodings'])) == len(package['encodings'])
                and set(package['encodings']) <= ENCODINGS, 'Invalid package encodings')
    inputs = {i['name']: i for i in run['inputs']}
    require(len(inputs) == len(run['inputs']) and set(inputs) == TIMED | PROBES, 'Original input coverage')
    for name, item in inputs.items():
        require(type(item['timed']) is bool and item['timed'] == (name in TIMED), 'Timed input classification')
        require(integer(item['bytes'], 0) and digest(item['sha256']), 'Input provenance')
    # Package metadata lists all installed adapters. Verification is the explicit
    # scope selected by --only/--encodings, rather than its Cartesian product.
    cases = {}
    for verification in run['verification']:
        case = (verification['id'], verification['encoding'])
        require(case not in cases, 'Duplicate verification case')
        require(case[0] in packages and case[1] in packages[case[0]]['encodings'], 'Unknown verification case')
        require(type(verification['passed']) is bool, 'Invalid verification status')
        checks = verification['checks']
        require(len(checks) == len(inputs) and {c['dataset'] for c in checks} == set(inputs), 'Correctness input coverage')
        for check in checks:
            require(integer(check['tokens'], 0) and integer(check['actualTokens'], 0)
                    and integer(check['firstDifference'], -1), 'Invalid correctness counters')
            require(type(check['roundTrip']) is bool and type(check['count']) is bool, 'Invalid correctness flags')
            require('error' not in check or isinstance(check['error'], str), 'Invalid correctness error')
        require(verification['passed'] == all(correct(c) for c in checks), 'Inconsistent verification status')
        cases[case] = verification
    require(cases, 'Missing verification scope')
    for encoding in {case[1] for case in cases}:
        require(f'encoding/{encoding}.js' in run['candidateBuild'], 'Missing encoding build hash')
    seen = set()
    for sample in run['samples']:
        case = (sample['id'], sample['encoding'])
        require(case in cases, 'Unexpected timing case')
        key = (*case, sample['round'])
        require(integer(sample['round'], 1) and sample['round'] <= 5 and key not in seen, 'Duplicate or invalid timing round')
        seen.add(key)
        require(finite(sample['initialization']['ms'], 0), 'Invalid initialization time')
        require(finite(sample['peakRssMiB']) and sample['peakRssMiB'] > 0, 'Invalid timing peak RSS')
        require(integer(sample['checksum']), 'Invalid timing checksum')
        for snapshot in [sample['initialization']['memory'], sample['retained']]:
            require(set(snapshot) == MEM and all(finite(v) for v in snapshot.values()), 'Invalid timing memory diagnostics')
        require(set(sample['datasets']) == TIMED, 'Timed dataset coverage')
        for operations in sample['datasets'].values():
            require(set(operations) == set(OPS), 'Operation coverage')
            for timing in operations.values():
                for value, min_ms, min_calls in [(timing, settings['minMs'], settings['minimumCalls']),
                                                  (timing['warmup'], settings['warmupMs'], settings['warmupMinimumCalls'])]:
                    require(integer(value['calls'], min_calls), 'Insufficient operation/warmup calls')
                    require(finite(value['elapsedMs'], min_ms) and finite(value['ms']) and value['ms'] > 0, 'Insufficient or invalid operation/warmup timing')
                    require(math.isclose(value['ms'] * value['calls'], value['elapsedMs'], rel_tol=1e-9, abs_tol=1e-9), 'Inconsistent operation/warmup timing')
    require(seen == {(*case, round_) for case in cases for round_ in range(1, 6)}, 'Missing timing case/round')
    return cases


def validate_memory(memory, timing, timing_path, cases):
    require(type(memory['schema']) is int and memory['schema'] == 1 and isinstance(memory['finishedAt'], str) and memory['finishedAt'] and type(memory['errors']) is list and not memory['errors'], 'Incomplete or failed memory run')
    require(memory['protocol'] == 'settled-one-pass-v1', 'Unknown memory protocol')
    require(type(memory['settings']['rounds']) is int and memory['settings']['rounds'] == 5 and type(memory['settings']['passes']) is int and memory['settings']['passes'] == 1
            and memory['settings']['operations'] == list(OPS), 'Memory workload budget/order')
    require(memory['candidateBuild'] == timing['candidateBuild'], 'Memory executed build differs')
    require(memory['packages'] == timing['packages'], 'Memory package versions differ')
    require(memory['inputs'] == [i for i in timing['inputs'] if i['timed']], 'Memory input hashes/order differ')
    require(memory['productionSourceUnchanged'] is True, 'Production source changed')
    require(memory['timingSourceCommit'] == timing['environment']['gitCommit'], 'Memory source provenance differs')
    require(memory['timingSha256'] == sha256(timing_path), 'Memory timing-file hash differs')
    environment(memory['environment'])
    for key in ['engine', 'engineVersion', 'hostname', 'platform', 'arch', 'kernel', 'executable']:
        require(memory['environment'][key] == timing['environment'][key], f'Memory runtime/host differs: {key}')
    require(set(memory['expectedChecksums']) == {case[1] for case in cases}, 'Memory checksum encoding coverage')
    require(all(integer(v) for v in memory['expectedChecksums'].values()), 'Invalid expected memory checksum')
    seen = set()
    for sample in memory['samples']:
        case = (sample['id'], sample['encoding'])
        key = (*case, sample['round'])
        require(case in cases and integer(sample['round'], 1) and sample['round'] <= 5 and key not in seen, 'Unexpected/duplicate memory case or round')
        seen.add(key)
        require(set(sample['datasets']) == TIMED, 'Memory dataset coverage')
        for snapshot in [sample['baseline'], sample['initialized'], sample['final']]:
            require(set(snapshot) == MEM and all(finite(v, 0) for v in snapshot.values()), 'Invalid absolute memory snapshot')
        for delta in [sample['initialization'], sample['retained'], *sample['datasets'].values()]:
            require(set(delta) == MEM and all(finite(v) for v in delta.values()), 'Invalid memory delta')
        require(finite(sample['peakRssMiB']) and sample['peakRssMiB'] > 0, 'Invalid settled peak RSS')
        require(integer(sample['checksum']) and sample['checksum'] == memory['expectedChecksums'][case[1]], 'Memory workload checksum differs')
        for metric in MEM:
            require(math.isclose(sample['initialization'][metric], (sample['initialized'][metric] - sample['baseline'][metric]) / 2**20, abs_tol=1e-9), 'Inconsistent initialized memory delta')
            require(math.isclose(sample['retained'][metric], (sample['final'][metric] - sample['initialized'][metric]) / 2**20, abs_tol=1e-9), 'Inconsistent retained memory delta')
    require(seen == {(*case, round_) for case in cases for round_ in range(1, 6)}, 'Missing memory case/round')


def stats(values):
    return {'median': median(values), 'min': min(values), 'max': max(values)}


def summarize(timing, cases, memory=None):
    groups = {}
    for (id_, encoding), verification in cases.items():
        samples = [s for s in timing['samples'] if (s['id'], s['encoding']) == (id_, encoding)]
        package = next(p for p in timing['packages'] if p['id'] == id_)
        row = dict(id=id_, version=package['version'], eligible=all(correct(c) for c in verification['checks'] if c['dataset'] in TIMED), probe_failures=any(not correct(c) for c in verification['checks'] if c['dataset'] not in TIMED), metrics={}, datasets={})
        for op in OPS:
            row['metrics'][op] = stats([mean(s['datasets'][d][op]['ms'] for d in TIMED) for s in samples])
        row['metrics']['load'] = stats([s['initialization']['ms'] for s in samples])
        for name in [i['name'] for i in timing['inputs'] if i['timed']]:
            row['datasets'][name] = {op: stats([s['datasets'][name][op]['ms'] for s in samples]) for op in OPS}
        if memory is not None:
            samples = [s for s in memory['samples'] if (s['id'], s['encoding']) == (id_, encoding)]
            for phase, field in [('init', 'initialization'), ('retained', 'retained')]:
                for metric in ['heapUsed', 'rss']:
                    row['metrics'][f'{phase}_{metric}'] = stats([s[field][metric] for s in samples])
            for metric in ['heapUsed', 'rss']:
                row['metrics'][f'final_{metric}'] = stats([s['final'][metric] / 2**20 for s in samples])
            row['metrics']['peak_rss'] = stats([s['peakRssMiB'] for s in samples])
        groups.setdefault(encoding, []).append(row)
    for rows in groups.values():
        for location in ['metrics', *[i['name'] for i in timing['inputs'] if i['timed']]]:
            get = lambda row: row['metrics'] if location == 'metrics' else row['datasets'][location]
            for metric in get(rows[0]):
                eligible = sorted([r for r in rows if r['eligible'] and r['id'] != REFERENCE], key=lambda r: get(r)[metric]['median'])
                for index, row in enumerate(eligible, 1):
                    get(row)[metric]['rank'] = f'{index}/{len(eligible)}'
    return groups


def cell(stat, precision=6):
    text = f"{stat['median']:.{precision}f} [{stat['min']:.{precision}f}, {stat['max']:.{precision}f}]"
    return text + (f"; #{stat['rank']}" if 'rank' in stat else '; unranked')


def safe(value):
    return str(value).replace('|', r'\|').replace('\n', ' ')


def render(timing, cases, groups, timing_path, memory=None, memory_path=None):
    env = timing['environment']
    build = timing['candidateBuild']
    cpus = env.get('cpus', [])
    hardware = f"{len(cpus)} vCPUs; {', '.join(sorted({cpu['model'] for cpu in cpus}))}; {env.get('totalMemoryGiB', 'unrecorded')} GiB RAM" if cpus else 'CPU/RAM details are in the raw timing environment.'
    build_digest = hashlib.sha256(json.dumps(build, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
    lines = ['# Scoped legacy benchmark results', '',
             f"{safe(env['engine'])} {safe(env['engineVersion'])}; {safe(env['hostname'])}; {safe(env['platform'])}/{safe(env['arch'])}; kernel {safe(env['kernel'])}. {safe(hardware)}", '',
             'Exactly five fresh processes per tokenizer/encoding. Values are median [minimum, maximum]; lower is better. Ranks follow medians; overlapping ranges do not establish a distinct winner. The npm package is an unranked historical reference. Timed correctness mismatches are shown but excluded from every ranking.', '',
             'These are API-return timings: the checksum reads output length, so decoded strings can remain lazy ropes. Decode plus a complete character read is a separate diagnostic, not included in these ranks.', '',
             'Eligibility means the seven timed inputs match. Additional probe flags here cover only the five original probes in this raw file; expanded Unicode/casefold probes in the realistic reports expose further mismatches, including the npm reference and Golia. See the optimized interpretation for the complete limitations.', '',
             '**The seven-input arithmetic mean is dominated by synthetic LatinRepeat and UnicodeRandom. It is a legacy compatibility score, not a realistic-workload or universal winner claim.** Inspect every input below and the separately published realistic categories/modes.', '',
             f"Warmup: ≥{timing['settings']['warmupMs']} ms and ≥{timing['settings']['warmupMinimumCalls']} calls per operation; measurement: ≥{timing['settings']['minMs']} ms and ≥{timing['settings']['minimumCalls']} calls. Default caches and repeated inputs; load excludes process startup. Filesystem caches are warm; CPU affinity/frequency are uncontrolled on the VM.", '',
             '## Evidence and selected scope', '',
             f"- Timing SHA-256: `{sha256(timing_path)}`", f"- Source commit: `{safe(env['gitCommit'])}`; tracked diff SHA-256: `{env['gitDiffSha256']}`",
             f"- Executed-build manifest SHA-256 (canonical JSON, sorted keys): `{build_digest}`",
             f"- Core module SHA-256: `{build['BytePairEncodingCore.js']}`; GptEncoding SHA-256: `{build['GptEncoding.js']}`",
             f"- Selected verification cases: {', '.join('`' + safe(id_) + '/' + encoding + '`' for id_, encoding in cases)}", '']
    if memory is None:
        lines += ['Settled memory was not supplied for this timing/build. No footprint ranks are inferred from transient timing-worker snapshots.', '']
    else:
        lines += [f"- Memory SHA-256: `{sha256(memory_path)}`; protocol `{memory['protocol']}`; source commit `{safe(memory['environment']['gitCommit'])}`.", '',
                  'Memory uses separate fresh processes: settled initialization deltas, retained growth after one encode/decode/count pass, and absolute final/peak process footprint. Final/peak RSS include harness/corpus. Timing-loop memory diagnostics are superseded and unranked.', '']
    for encoding, rows in groups.items():
        lines += [f'## {encoding}', '', '### Legacy seven-input mean latency (ms/call)', '',
                  '| Tokenizer | Version | Status | Encode | Decode | Count |', '|---|---|---|---:|---:|---:|']
        for row in rows:
            status = 'TIMED MISMATCH' if not row['eligible'] else 'reference' if row['id'] == REFERENCE else 'eligible'
            if row['probe_failures']:
                status += '; additional probe mismatch'
            lines.append('| ' + ' | '.join([safe(row['id']), safe(row['version']), status] + [cell(row['metrics'][op]) for op in OPS]) + ' |')
        keys = [('load', 'Load ms')]
        if memory is not None:
            keys += [('init_heapUsed', 'Init heap Δ MiB'), ('init_rss', 'Init RSS Δ MiB')]
        lines += ['', '### Initialization', '', '| Tokenizer | ' + ' | '.join(label for _, label in keys) + ' |', '|---|' + '---:|' * len(keys)]
        for row in rows:
            lines.append('| ' + safe(row['id']) + ' | ' + ' | '.join(cell(row['metrics'][key], 3) for key, _ in keys) + ' |')
        if memory is not None:
            keys = [('retained_heapUsed', 'Retained heap Δ MiB'), ('retained_rss', 'Retained RSS Δ MiB'), ('final_heapUsed', 'Final heap MiB'), ('final_rss', 'Final RSS MiB'), ('peak_rss', 'One-pass peak RSS MiB')]
            lines += ['', '### Settled working memory', '', '| Tokenizer | ' + ' | '.join(label for _, label in keys) + ' |', '|---|' + '---:|' * len(keys)]
            for row in rows:
                lines.append('| ' + safe(row['id']) + ' | ' + ' | '.join(cell(row['metrics'][key], 3) for key, _ in keys) + ' |')
        lines += ['', '### Per-input latency (ms/call)', '']
        for name in [i['name'] for i in timing['inputs'] if i['timed']]:
            local = next((r for r in rows if r['id'] == LOCAL), None)
            ranks = ', '.join(op + ' #' + local['datasets'][name][op].get('rank', 'unranked') for op in OPS) if local else 'local checkout absent'
            lines += [f'#### {name} — {ranks}', '', '| Tokenizer | Encode | Decode | Count |', '|---|---:|---:|---:|']
            for row in rows:
                lines.append('| ' + safe(row['id']) + ' | ' + ' | '.join(cell(row['datasets'][name][op]) for op in OPS) + ' |')
    lines += ['', '## Correctness mismatches', '']
    failures = [(case, check) for case, value in cases.items() for check in value['checks'] if not correct(check)]
    if not failures:
        lines.append('No timed-input or additional-probe mismatches were recorded.')
    for (id_, encoding), check in failures:
        lines.append(f"- {safe(id_)}/{encoding}: {'TIMED — excluded from ranks' if check['dataset'] in TIMED else 'additional non-timed probe'}; `{safe(json.dumps(check, ensure_ascii=True, sort_keys=True))}`")
    lines += ['', '## Input provenance', '', '| Input | Timed | UTF-8 bytes | SHA-256 |', '|---|---|---:|---|']
    for item in timing['inputs']:
        lines.append(f"| {safe(item['name'])} | {item['timed']} | {item['bytes']} | `{item['sha256']}` |")
    return '\n'.join(lines) + '\n'


def main(argv=None):
    args = sys.argv[1:] if argv is None else argv
    require(len(args) == 3, 'Usage: legacy-report.py TIMING.json MEMORY.json|- OUTPUT.md')
    timing_path, memory_arg, output = args
    raw_paths = {Path(timing_path).resolve()}
    if memory_arg != '-':
        raw_paths.add(Path(memory_arg).resolve())
    require(Path(output).resolve() not in raw_paths, 'Output must not overwrite raw timing or memory evidence')
    timing = json.loads(Path(timing_path).read_text())
    cases = validate_timing(timing)
    memory = None if memory_arg == '-' else json.loads(Path(memory_arg).read_text())
    if memory is not None:
        validate_memory(memory, timing, timing_path, cases)
    groups = summarize(timing, cases, memory)
    Path(output).write_text(render(timing, cases, groups, timing_path, memory, memory_arg if memory is not None else None))


if __name__ == '__main__':
    try:
        main()
    except (ValueError, KeyError, TypeError, OSError) as error:
        raise SystemExit(f'Cannot publish legacy report: {error}') from error
