#!/usr/bin/env python3
"""Publish compact, workload-specific summaries of complete experiment runs."""
import argparse
from datetime import datetime
import hashlib
import itertools
import json
import math
from pathlib import Path
import re
import statistics

SHA = re.compile(r'^[0-9a-f]{64}$')
COMMIT = re.compile(r'^[0-9a-f]{40}$')
OPERATIONS = ('encode', 'decode', 'count')
MODES = ('repeated', 'stream')


def require(condition, message):
    if not condition:
        raise ValueError(message)


def number(value, *, minimum=0, integer=False):
    return (type(value) in (int, float) and math.isfinite(value)
            and value >= minimum and (not integer or type(value) is int))


def hash_value(value):
    require(isinstance(value, str) and SHA.fullmatch(value), 'Missing/invalid SHA-256 provenance')


def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':')).encode()).hexdigest()


def strings(values, allowed=None):
    return (isinstance(values, list) and bool(values)
            and all(isinstance(value, str) and value for value in values)
            and len(set(values)) == len(values)
            and (allowed is None or set(values) <= set(allowed)))


def validate(run):
    """Fail closed before computing any publication ranks."""
    require(run['schema'] == 1, 'Unknown schema')
    require(run['complete'] is True, 'Incomplete run')
    require(run['exploratory'] is False, 'Exploratory runs cannot be published')
    c = run['configuration']
    rounds = c['rounds']
    require(c['consume'] in ('length', 'full'), 'Unknown output consumer')
    require(number(rounds, minimum=5, integer=True), 'Need >=5 process rounds')
    require(number(c['minMs'], minimum=100), 'Measurement budget below 100 ms')
    require(number(c['warmMs'], minimum=50), 'Warmup budget below 50 ms')
    require(number(c['warmCalls'], minimum=20, integer=True), 'Warmup call budget below 20')
    require(strings(c['entries']) and {'baseline', 'candidate'} <= set(c['entries']), 'Invalid entries')
    require(strings(c['operations'], OPERATIONS) and strings(c['modes'], MODES), 'Invalid operation/mode selection')
    require(c['encoding'] in ('cl100k_base', 'o200k_base'), 'Unknown encoding')
    runtime = run['runtime']
    require((runtime['bun'] is None and runtime['version'] == 'v26.12.0')
            or (runtime['bun'] == '1.4.3' and isinstance(runtime['version'], str)
                and runtime['version'].startswith('v26.')), 'Unexpected benchmark runtime')
    for field in ('executable', 'platform', 'arch'):
        require(isinstance(runtime[field], str) and runtime[field], 'Incomplete runtime provenance')
    start = datetime.fromisoformat(run['startedAt'].replace('Z', '+00:00'))
    end = datetime.fromisoformat(run['completedAt'].replace('Z', '+00:00'))
    require(end >= start, 'Invalid run timestamps')
    candidate = run['candidate']
    require(isinstance(candidate['gitCommit'], str) and COMMIT.fullmatch(candidate['gitCommit']), 'Missing candidate source commit')
    require(isinstance(candidate['dirty'], str) and isinstance(candidate['root'], str) and candidate['root'], 'Missing source status/root')
    require(isinstance(candidate['files'], dict) and {'BytePairEncodingCore.js', 'GptEncoding.js', f"encoding/{c['encoding']}.js"} <= set(candidate['files']), 'Missing executed build hashes')
    for value in candidate['files'].values():
        hash_value(value)
    require(isinstance(run['harness'], dict) and {'run.mjs', 'worker.mjs', 'protocol.mjs'} <= set(run['harness']), 'Missing harness provenance')
    for value in run['harness'].values():
        hash_value(value)
    require(run['baseline']['package'] == 'gpt-tokenizer' and isinstance(run['baseline']['version'], str) and run['baseline']['version'], 'Missing baseline package provenance')
    for entry in set(c['entries']) - {'baseline', 'candidate'}:
        require(isinstance(run['packages'][entry], str) and run['packages'][entry], 'Missing competitor version')
    require(isinstance(run['packages']['tiktoken'], str) and run['packages']['tiktoken'], 'Missing oracle version')
    hardware = run['hardware']
    require(isinstance(hardware['hostname'], str) and hardware['hostname'], 'Missing hostname')
    for field in ('loadStart', 'loadEnd'):
        require(isinstance(hardware[field], list) and len(hardware[field]) == 3 and all(number(value) for value in hardware[field]), 'Invalid load averages')
    require(number(hardware['memoryBytes'], minimum=1, integer=True) and hardware['release'], 'Missing hardware provenance')
    require(isinstance(hardware['cpus'], list) and hardware['cpus'], 'Missing CPU provenance')
    for cpu in hardware['cpus']:
        require(isinstance(cpu['model'], str) and cpu['model'] and number(cpu['speed']), 'Invalid CPU provenance')
    corpus = run['corpus']
    hash_value(corpus['sha256'])
    require(number(corpus['version'], minimum=1, integer=True) and isinstance(corpus['provenance'], str) and corpus['provenance'], 'Missing corpus provenance')
    require(isinstance(corpus['documents'], list) and corpus['documents'], 'Empty corpus')
    documents = {}
    for document in corpus['documents']:
        require(isinstance(document['id'], str) and document['id'] and document['id'] not in documents, 'Duplicate/missing document ID')
        require(isinstance(document['category'], str) and document['category'], 'Missing category')
        require(number(document['utf8Bytes'], minimum=1, integer=True), 'Missing document size')
        hash_value(document['sha256'])
        expected_streams = 1 if document['category'] == 'legacy' else 32
        require(isinstance(document['streamSha256'], list) and len(document['streamSha256']) == expected_streams, 'Missing stream hashes')
        for value in document['streamSha256']:
            hash_value(value)
        documents[document['id']] = document
    require(bool(c['legacy']) == any(d['category'] == 'legacy' for d in documents.values()), 'Legacy manifest/config mismatch')
    expected_keys = set(itertools.product(documents, c['modes'], c['operations']))
    expected_inputs = sum(1 + len(document['streamSha256']) for document in documents.values())
    require(len(run['samples']) == len(c['entries']) * rounds, 'Wrong process coverage')
    seen = set()
    expected_probes = None
    values = {}
    for sample in run['samples']:
        entry, round_id = sample['entry'], sample['round']
        require(entry in c['entries'] and number(round_id, integer=True) and round_id < rounds, 'Unknown entry/round')
        require((entry, round_id) not in seen, 'Duplicate process round')
        seen.add((entry, round_id))
        require(sample['runtime'] == {'node': runtime['version'], 'bun': runtime['bun']}, 'Worker/parent runtime mismatch')
        verification = sample['verification']
        require(verification['passed'] is True and verification['reference'] == 'tiktoken'
                and verification['documents'] == len(documents) and verification['inputs'] == expected_inputs, 'Missing correctness coverage')
        require(number(sample['checksum']), 'Invalid checksum')
        require(number(sample['initializationMs']), 'Invalid initialization duration')
        for phase in ('before', 'initialized', 'afterFirstPass'):
            require(all(number(sample[phase][key]) for key in ('heapUsed', 'rss', 'external', 'arrayBuffers')), 'Invalid settled memory diagnostics')
        first_pass = sample['firstPass']
        require(len(first_pass) == len(documents) and {row['id'] for row in first_pass} == set(documents), 'Incomplete first pass')
        require(all(number(row[key]) for row in first_pass for key in ('encodeMs', 'decodeMs', 'countMs')), 'Invalid first-pass duration')
        require(isinstance(sample['semanticProbes'], list) and sample['semanticProbes'], 'Missing semantic probes')
        probe_texts = set()
        for probe in sample['semanticProbes']:
            require(isinstance(probe['text'], str) and probe['text'] not in probe_texts, 'Duplicate/invalid semantic probe')
            probe_texts.add(probe['text'])
            require((isinstance(probe.get('error'), str) and probe['error']) or all(type(probe.get(key)) is bool for key in ('ids', 'roundTrip', 'count')), 'Invalid semantic-probe result')
        if expected_probes is None:
            expected_probes = probe_texts
        require(probe_texts == expected_probes, 'Inconsistent semantic-probe coverage')
        measurement_keys = set()
        for measurement in sample['measurements']:
            key = (measurement['id'], measurement['mode'], measurement['operation'])
            require(key in expected_keys and key not in measurement_keys, 'Unknown/duplicate measurement')
            measurement_keys.add(key)
            require(measurement['category'] == documents[key[0]]['category'], 'Category mismatch')
            for timing, minimum_ms, minimum_calls in ((measurement, c['minMs'], 5), (measurement['warmup'], c['warmMs'], c['warmCalls'])):
                require(number(timing['calls'], minimum=minimum_calls, integer=True)
                        and number(timing['elapsedMs'], minimum=minimum_ms)
                        and number(timing['ms'], minimum=1e-15), 'Invalid/underbudget timing')
                require(math.isclose(timing['elapsedMs'] / timing['calls'], timing['ms'], rel_tol=1e-9, abs_tol=1e-12), 'Inconsistent timing arithmetic')
            values[(entry, round_id, *key)] = measurement['ms']
        require(measurement_keys == expected_keys, 'Missing measurement coverage')
    require(seen == set(itertools.product(c['entries'], range(rounds))), 'Missing process rounds')
    return values, documents


def category_score(run, values, documents, entry, category, mode, operation):
    ids = [identifier for identifier, document in documents.items() if document['category'] == category]
    ratios = [statistics.geometric_mean(values[('baseline', round_id, identifier, mode, operation)] / values[(entry, round_id, identifier, mode, operation)] for identifier in ids) for round_id in range(run['configuration']['rounds'])]
    require(all(number(value, minimum=1e-300) for value in ratios), 'Invalid normalized score')
    return statistics.median(ratios)


def escape(value):
    return str(value).replace('|', '\\|').replace('\n', ' ')


def distribution(values):
    return f'{statistics.median(values) * 1000:.3f} [{min(values) * 1000:.3f}, {max(values) * 1000:.3f}]'


def section(path, run, values, documents):
    c, runtime = run['configuration'], run['runtime']
    engine = f"Bun {runtime['bun']}" if runtime['bun'] else f"Node {runtime['version']}"
    consumption = "API return (length only)" if c["consume"] == "length" else "API + complete output checksum"
    title = f"{engine} / {c['encoding']} / {consumption}"
    lines = [f'## {title}', '', f"Source: `{escape(path.name)}`; SHA-256 `{hashlib.sha256(path.read_bytes()).hexdigest()}`.", '', '| Category | Mode | Encode | Decode | Count |', '|---|---|---|---|---|']
    ranked = [entry for entry in c['entries'] if entry != 'baseline']
    for category in dict.fromkeys(document['category'] for document in documents.values()):
        for mode in c['modes']:
            cells = []
            for operation in OPERATIONS:
                if operation not in c['operations']:
                    cells.append('not run')
                    continue
                scores = {entry: category_score(run, values, documents, entry, category, mode, operation) for entry in ranked}
                ordered = sorted(ranked, key=lambda entry: -scores[entry])
                leader = ordered[0]
                candidate = scores['candidate']
                rank = ordered.index('candidate') + 1
                cells.append(f"#{rank}/{len(ranked)}; {candidate:.2f}× npm; {escape(leader)}; {scores[leader] / candidate:.2f}× C/L")
            lines.append(f"| {escape(category)} | {mode} | {' | '.join(cells)} |")
    lines += ['', '### Loss ledger versus npm', '', 'Every per-document median regression is included, even when ranges overlap. These rows compare median absolute latencies, independently of the paired category scores above. Durations are µs: median [min,max] over fresh processes; Δ is candidate minus npm. Small differences are descriptive, not proof of a regression.', '', '| Document | Mode | Operation | Candidate µs [range] | npm µs [range] | Δ µs | C/npm |', '|---|---|---|---:|---:|---:|---:|']
    losses = []
    for identifier, mode, operation in itertools.product(documents, c['modes'], c['operations']):
        candidate = [values[('candidate', round_id, identifier, mode, operation)] for round_id in range(c['rounds'])]
        baseline = [values[('baseline', round_id, identifier, mode, operation)] for round_id in range(c['rounds'])]
        cm, bm = statistics.median(candidate), statistics.median(baseline)
        if cm > bm:
            losses.append((cm / bm, f'| {escape(identifier)} | {mode} | {operation} | {distribution(candidate)} | {distribution(baseline)} | {(cm - bm) * 1000:.3f} | {cm / bm:.3f}× |'))
    lines.extend(row for _, row in sorted(losses, reverse=True))
    if not losses:
        lines += ['| none | — | — | — | — | — | — |']
    lines += ['', '### Correctness probes', '', 'Every timed document/variant passed exact IDs, count and round-trip checks in every process. Additional non-timed probe failures across **all rounds** follow; they do not silently disappear from the comparison.', '']
    probes = {}
    for sample in run['samples']:
        for probe in sample['semanticProbes']:
            if probe.get('error') or not all(probe.get(key) for key in ('ids', 'roundTrip', 'count')):
                key = (sample['entry'], json.dumps(probe, ensure_ascii=True, sort_keys=True))
                probes.setdefault(key, []).append(sample['round'])
    for (entry, probe), rounds in probes.items():
        lines.append(f'- `{escape(entry)}` rounds {", ".join(str(value + 1) for value in rounds)}: `{escape(probe)}`')
    if not probes:
        lines.append('No additional probe mismatches recorded.')
    hardware, candidate = run['hardware'], run['candidate']
    cpus = ', '.join(sorted(set(cpu['model'] for cpu in hardware['cpus'])))
    lines += ['', '### Provenance and limits', '', f"- Source commit `{candidate['gitCommit']}`; executed-build manifest SHA-256 `{digest(candidate['files'])}` ({len(candidate['files'])} JavaScript files). Working-tree status: {escape(candidate['dirty']) or 'clean'}.", f"- Harness manifest SHA-256 `{digest(run['harness'])}`; corpus v{run['corpus']['version']} SHA-256 `{run['corpus']['sha256']}`; document/variant manifest SHA-256 `{digest(run['corpus']['documents'])}`.", f"- Reported hardware: {len(hardware['cpus'])} CPUs ({escape(cpus)}), {hardware['memoryBytes'] / 2**30:.2f} GiB; {escape(runtime['platform'])}/{escape(runtime['arch'])}; {escape(hardware['release'])}.", f"- Runtime `{escape(runtime['executable'])}`; Node compatibility version `{runtime['version']}`; Bun `{runtime['bun'] or 'none'}`. {c['rounds']} processes/entry; warmup ≥{c['warmMs']} ms/{c['warmCalls']} calls; measurement ≥{c['minMs']} ms/5 calls.", f"- Baseline gpt-tokenizer {escape(run['baseline']['version'])}; competitors: {escape(json.dumps(run['packages'], sort_keys=True))}.", f"- Run {escape(run['startedAt'])} → {escape(run['completedAt'])}. Corpus: {escape(run['corpus']['provenance'])}", '- Length consumption measures API-return latency and may leave lazy output strings unflattened; full consumption includes reading the entire output. These metrics are not pooled. The 32-variant stream is bounded, warmed and repeatedly cycled; it is not an unlimited unique/cold workload. First-use and memory diagnostics remain in the raw/full report and are not ranked here. Five process ranges are descriptive, not statistical significance.', '']
    return '\n'.join(lines)


def render(paths):
    sections = []
    for path in paths:
        run = json.loads(path.read_text())
        values, documents = validate(run)
        sections.append(section(path, run, values, documents))
    intro = '''# Optimization overview

Each category and mode stands alone; there is no grand mean. Each operation cell
shows candidate rank among selected entries (excluding the historical npm baseline), median speedup
versus npm, leader name, and candidate/leader latency index (C/L; 1.00 is best).
A scoped rank of 1/1 is not a claim of market leadership.
Ranks use the median of process-level, equally weighted document geometric-mean
ratios (npm latency / entry latency), matching the full experiment report. C/L
is leader score / candidate score, a ratio of those category scores—not a median
absolute latency or a separate paired estimate. Close/overlapping process ranges
do not establish a statistically significant winner. Separate input files remain
separate comparisons; source/corpus differences are not silently pooled.
'''
    return intro + '\n\n' + '\n\n'.join(sections)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('inputs', nargs='+', type=Path)
    parser.add_argument('--output', required=True, type=Path)
    args = parser.parse_args()
    try:
        markdown = render(args.inputs)
    except (KeyError, ValueError, TypeError, ZeroDivisionError, OverflowError) as error:
        parser.error(f'Invalid publication input: {error}')
    args.output.write_text(markdown)


if __name__ == '__main__':
    main()
