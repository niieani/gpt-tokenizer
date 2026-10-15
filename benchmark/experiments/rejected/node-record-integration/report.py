"""Summarize engine-selected storage experiments; never pool different corpora/builds."""
import argparse
import hashlib
import json
import math
from pathlib import Path
from statistics import median


def geometric(values):
    return math.exp(sum(map(math.log, values)) / len(values))


def summarize(path):
    raw = json.loads(path.read_text())
    assert raw['schema'] == 'node-record-integration-v1' and raw['complete']
    config = raw['configuration']
    assert config['rounds'] >= 2 and raw['corpus']['version'] == 3
    entries, rounds = config['entries'], config['rounds']
    documents = {doc['id']: doc for doc in raw['corpus']['documents']}
    assert len(raw['samples']) == len(entries) * rounds
    cells = {(doc, mode, op) for doc in documents for mode in config['modes'] for op in config['operations']}
    samples, probes = {}, []
    for sample in raw['samples']:
        key = sample['entry'], sample['round']
        assert key not in samples and key[0] in entries and 0 <= key[1] < rounds
        assert sample['runtime']['bun'] == raw['runtime']['bun']
        assert sample['runtime']['node'] == raw['runtime']['node']
        assert sample['verification']['passed'] and sample['verification']['documents'] == len(documents)
        measurements = {}
        for value in sample['measurements']:
            cell = value['id'], value['mode'], value['operation']
            assert cell not in measurements and cell in cells
            assert value['category'] == documents[cell[0]]['category']
            assert math.isfinite(value['ms']) and value['ms'] > 0
            assert value['elapsedMs'] >= config['minMs'] and value['calls'] >= 5
            assert value['warmup']['elapsedMs'] >= config['warmMs'] and value['warmup']['calls'] >= config['warmCalls']
            measurements[cell] = value['ms']
        assert measurements.keys() == cells
        samples[key] = measurements
        for probe in sample['semanticProbes']:
            if probe.get('error') or not all(probe.get(flag) for flag in ['ids', 'roundTrip', 'count']):
                failure = sample['entry'], probe
                if failure not in probes:
                    probes.append(failure)
    assert len(samples) == len(entries) * rounds
    engine = 'Bun ' + raw['runtime']['bun'] if raw['runtime']['bun'] else 'Node ' + raw['runtime']['node']
    lines = [f"## {engine}, {config['encoding']}", '', raw['label'], '',
             f"Raw: `{path.name}` SHA256 `{hashlib.sha256(path.read_bytes()).hexdigest()}`. "
             f"{rounds} fresh processes per entry; warm ≥{config['warmMs']} ms/{config['warmCalls']} calls; measure ≥{config['minMs']} ms. "
             f"Corpus v{raw['corpus']['version']} `{raw['corpus']['sha256']}`. "
             f"Candidate `{raw['sources']['candidateCommit']}`, core source `{raw['sources']['candidateCoreSourceSHA256']}`. "
             f"Frozen public source `{raw['sources']['frozenPublicSourceCommit']}`.", '',
             'Each category gives equal weight to its documents. Ratios are paired geometric means per process, then median across processes. '
             'Ranks include only the selected non-baseline entries; 1/1 is not a market-lead claim. Frozen and npm baselines are unranked. No grand mean.', '',
             '| Category | Mode | Operation | Candidate/frozen speedup [range] | Candidate rank | Leader | Candidate/leader speed |',
             '|---|---|---|---:|---:|---|---:|']
    ranked = [entry for entry in entries if entry not in ('frozen', 'baseline')]
    for category in sorted({doc['category'] for doc in documents.values()}):
        for mode in config['modes']:
            for operation in config['operations']:
                chosen = [cell for cell in cells if documents[cell[0]]['category'] == category and cell[1:] == (mode, operation)]
                paired = {entry: [geometric([samples['frozen', r][cell] / samples[entry, r][cell] for cell in chosen]) for r in range(rounds)] for entry in ranked}
                scores = {entry: median(values) for entry, values in paired.items()}
                leader = max(scores, key=scores.get)
                values = paired['candidate']
                rank = 1 + sum(score > scores['candidate'] for score in scores.values())
                lines.append(f"| {category} | {mode} | {operation} | {median(values):.3f}× [{min(values):.3f}, {max(values):.3f}] | {rank}/{len(ranked)} | {leader} | {scores['candidate']/scores[leader]:.3f}× |")
    if config['legacy']:
        lines += ['', 'Legacy arithmetic mean is retained only to diagnose the original seven synthetic cases; it is not the realistic workload score.', '',
                  '| Operation | Candidate mean µs | Frozen mean µs | Paired mean speedup [range] |',
                  '|---|---:|---:|---:|']
        for operation in config['operations']:
            chosen = [cell for cell in cells if cell[2] == operation]
            means = {entry: [sum(samples[entry, r][cell] for cell in chosen)/len(chosen) for r in range(rounds)] for entry in ['candidate', 'frozen']}
            ratios = [means['frozen'][r]/means['candidate'][r] for r in range(rounds)]
            lines.append(f"| {operation} | {median(means['candidate'])*1000:.2f} | {median(means['frozen'])*1000:.2f} | {median(ratios):.3f}× [{min(ratios):.3f}, {max(ratios):.3f}] |")
    lines += ['', 'Per-document losses versus frozen use medians of absolute timings, independently from the paired category ratios above. '
              'Ranges are across processes; these measurements do not establish a universal workload distribution.', '',
              '| Document | Mode | Operation | Candidate µs [range] | Frozen µs [range] | Added µs | Candidate/frozen time |',
              '|---|---|---|---:|---:|---:|---:|']
    losses = 0
    for cell in sorted(cells):
        candidate = [samples['candidate', r][cell] * 1000 for r in range(rounds)]
        frozen = [samples['frozen', r][cell] * 1000 for r in range(rounds)]
        c, f = median(candidate), median(frozen)
        if c > f:
            losses += 1
            lines.append(f"| {' | '.join(cell)} | {c:.3f} [{min(candidate):.3f}, {max(candidate):.3f}] | {f:.3f} [{min(frozen):.3f}, {max(frozen):.3f}] | {c-f:.3f} | {c/f:.3f}× |")
    if not losses:
        lines += ['| None | — | — | — | — | — | — |']
    lines += ['', 'Initialization and settled first-pass memory are descriptive fresh-process diagnostics, not throughput ranks.', '',
              '| Entry | Import ms [range] | Initialized heap delta MiB | First-pass heap delta MiB | First-pass RSS delta MiB |',
              '|---|---:|---:|---:|---:|']
    for entry in entries:
        rows = [sample for sample in raw['samples'] if sample['entry'] == entry]
        init = [row['initializationMs'] for row in rows]
        memory = lambda field, phase: median([(row[phase][field] - row['before'][field]) / 2**20 for row in rows])
        lines.append(f"| {entry} | {median(init):.2f} [{min(init):.2f}, {max(init):.2f}] | {memory('heapUsed','initialized'):.2f} | {memory('heapUsed','afterFirstPass'):.2f} | {memory('rss','afterFirstPass'):.2f} |")
    lines += ['', 'Semantic probes (outside timed document coverage):', '']
    lines.extend(f'- `{entry}`: `{json.dumps(probe, ensure_ascii=True)}`' for entry, probe in probes)
    if not probes:
        lines.append('- All probes passed.')
    lines += ['', 'Hardware: `' + json.dumps(raw['hardware'], sort_keys=True) + '`.', '']
    return '\n'.join(lines)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('inputs', type=Path, nargs='+')
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    command = 'python3 benchmark/experiments/rejected/node-record-integration/report.py ' + ' '.join(str(path) for path in args.inputs) + ' --output ' + str(args.output)
    args.output.write_text('<!-- Generated by benchmark/experiments/rejected/node-record-integration/report.py; regenerate: ' + command + ' -->\n\n# Engine-selected lookup experiment\n\n' + '\n'.join(summarize(path) for path in args.inputs))
