#!/usr/bin/env python3
"""Generate Node/o200k README charts from validated final raw results only.

python3 charts.py TIMING.json MEMORY.json REALISTIC.json OUTPUT_DIRECTORY
Requires ../requirements-report.txt; does not run benchmarks or use the network.
"""
import argparse
import importlib.util
import json
from pathlib import Path
import statistics
import sys

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import overview

spec = importlib.util.spec_from_file_location('legacy_report', HERE / 'legacy-report.py')
legacy = importlib.util.module_from_spec(spec)
spec.loader.exec_module(legacy)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('timing', type=Path)
    parser.add_argument('memory', type=Path)
    parser.add_argument('realistic', type=Path)
    parser.add_argument('output', type=Path)
    args = parser.parse_args()
    timing = json.loads(args.timing.read_text())
    memory = json.loads(args.memory.read_text())
    realistic = json.loads(args.realistic.read_text())
    cases = legacy.validate_timing(timing)
    legacy.validate_memory(memory, timing, args.timing, cases)
    values, documents = overview.validate(realistic)
    assert timing['environment']['engine'] == 'node'
    assert timing['environment']['engineVersion'] == '26.12.0'
    assert set(encoding for _, encoding in cases) == {'o200k_base'}
    assert realistic['configuration']['encoding'] == 'o200k_base'
    assert realistic['runtime']['bun'] is None
    assert realistic['configuration']['consume'] == 'length'
    assert timing['candidateBuild'] == realistic['candidate']['files']
    rows = legacy.summarize(timing, cases, memory)['o200k_base']
    rows = [row for row in rows if row['eligible']]
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    plt.rcParams.update({'font.size': 10, 'axes.spines.top': False,
                         'axes.spines.right': False, 'figure.dpi': 150})
    args.output.mkdir(parents=True, exist_ok=True)

    def label(row):
        return row['id'].replace('gpt-tokenizer:local', 'gpt-tokenizer (checkout)').replace('gpt-tokenizer:npm', 'gpt-tokenizer 4.0.3 (reference)')

    def panels(filename, metrics, title, caption):
        fig, axes = plt.subplots(1, len(metrics), figsize=(18, 6), squeeze=False)
        for ax, (metric, heading, unit, logarithmic) in zip(axes[0], metrics):
            ordered = sorted(rows, key=lambda row: row['metrics'][metric]['median'], reverse=True)
            centers = [row['metrics'][metric]['median'] for row in ordered]
            errors = [[row['metrics'][metric]['median'] - row['metrics'][metric]['min'] for row in ordered],
                      [row['metrics'][metric]['max'] - row['metrics'][metric]['median'] for row in ordered]]
            colors = ['#087f6d' if row['id'] == 'gpt-tokenizer:local' else '#aeb7c2' if row['id'] == 'gpt-tokenizer:npm' else '#5779a3' for row in ordered]
            ax.barh(range(len(ordered)), centers, xerr=errors, color=colors, capsize=2)
            ax.set_yticks(range(len(ordered)), [label(row) for row in ordered], fontsize=8)
            if logarithmic:
                ax.set_xscale('log')
            ax.set_title(heading)
            ax.set_xlabel(unit + '; lower is better')
            ax.grid(axis='x', alpha=.15)
        fig.suptitle(title, fontsize=15)
        fig.text(.5, .015, caption, ha='center', fontsize=9)
        fig.tight_layout(rect=(0, .05, 1, .95))
        fig.savefig(args.output / filename, bbox_inches='tight')
        plt.close(fig)

    panels('optimized-latency.png', [(op, 'Decode (API return)' if op == 'decode' else op.title(), 'ms/call (log)', True) for op in ('encode', 'decode', 'count')],
           'Node 26.12.0 · o200k_base · original seven-input arithmetic mean',
           'Synthetic inputs dominate. Output length only; decoded text may remain lazy. Five processes, median [min,max]. npm reference unranked.')
    panels('optimized-footprint.png', [('load', 'Import + construction', 'ms', False),
                                    ('init_rss', 'Settled initialization RSS delta', 'MiB', False),
                                    ('retained_heapUsed', 'Retained heap growth after one pass', 'MiB', False)],
           'Node 26.12.0 · o200k_base · initialization and separate settled memory',
           'Memory: five fresh one-pass workers, settled GC between snapshots; large byte-heavy decode included. RSS includes native/WASM storage.')

    config = realistic['configuration']
    categories = list(dict.fromkeys(doc['category'] for doc in documents.values()))
    contenders = [entry for entry in config['entries'] if entry != 'baseline']
    fig, axes = plt.subplots(2, 3, figsize=(16, 9), sharey=True)
    for mode_index, mode in enumerate(('repeated', 'stream')):
        for op_index, operation in enumerate(('encode', 'decode', 'count')):
            ax = axes[mode_index, op_index]
            ids_by_category = [[identifier for identifier, doc in documents.items() if doc['category'] == category] for category in categories]
            for entry in [entry for entry in contenders if entry in ('candidate', '@goliapkg/tiktoken-wasm')]:
                medians, lows, highs = [], [], []
                for ids in ids_by_category:
                    scores = [statistics.geometric_mean(values[('baseline', round_id, identifier, mode, operation)] / values[(entry, round_id, identifier, mode, operation)] for identifier in ids) for round_id in range(config['rounds'])]
                    center = statistics.median(scores)
                    medians.append(center)
                    lows.append(center - min(scores))
                    highs.append(max(scores) - center)
                ax.errorbar(medians, range(len(categories)), xerr=[lows, highs], fmt='o-', markersize=4,
                            label='gpt-tokenizer checkout' if entry == 'candidate' else 'Golia WASM',
                            color='#087f6d' if entry == 'candidate' else '#a65b28', capsize=2)
            ax.axvline(1, color='#707070', linestyle='--', linewidth=1)
            ax.set_xscale('log')
            ax.set_yticks(range(len(categories)), categories)
            ax.invert_yaxis() if not (mode_index or op_index) else None
            ax.set_title(f'{operation.title()} · {mode}')
            ax.set_xlabel('Speedup vs npm 4.0.3; higher is better')
            ax.grid(axis='x', alpha=.15)
            if not (mode_index or op_index):
                ax.legend(fontsize=8)
    fig.suptitle('Node 26.12.0 · o200k_base · selected checkout / Golia comparison', fontsize=15)
    fig.text(.5, .015, 'Selected entries, not all category leaders: see the overview for all ranks. Five processes, median [min,max]. Stream = 32 warmed variants. Output length only.', ha='center', fontsize=9)
    fig.tight_layout(rect=(0, .05, 1, .95))
    fig.savefig(args.output / 'optimized-realistic.png', bbox_inches='tight')
    plt.close(fig)


if __name__ == '__main__':
    main()
