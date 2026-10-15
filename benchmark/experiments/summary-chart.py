"""Generate the compact README SVG from validated recorded measurements."""
import html
import importlib.util
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('legacy', HERE / 'legacy-report.py')
legacy = importlib.util.module_from_spec(spec)
spec.loader.exec_module(legacy)
path = Path(sys.argv[1]) if len(sys.argv) > 1 else HERE.parent / 'results/optimized-canonical-node-o200k.json'
run = json.loads(path.read_text())
cases = legacy.validate_timing(run)
assert run['environment']['engine'] == 'node'
assert run['environment']['engineVersion'] == '26.12.0'
assert {encoding for _, encoding in cases} == {'o200k_base'}
rows = legacy.summarize(run, cases, None)['o200k_base']
candidate = next(row for row in rows if row['id'] == 'gpt-tokenizer:local')
reference = next(row for row in rows if row['id'] == 'gpt-tokenizer:npm')
parts = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 550" role="img" aria-labelledby="title desc">',
         '<title id="title">gpt-tokenizer: #1 encode, decode API return, and count on the original seven-input mean</title>',
         '<desc id="desc">Node 26.12.0, o200k_base. Median of five fresh processes, milliseconds per call; lower is better. Each panel compares the checkout, the fastest other tokenizer, and the unranked npm reference. Large synthetic inputs dominate this mean; this is not a realistic-workload ranking.</desc>',
         '<rect width="760" height="550" rx="12" fill="#f5f7fa"/>',
         '<g font-family="system-ui, sans-serif" fill="#172336">',
         '<text x="24" y="32" font-size="20" font-weight="700">#1 on the original seven-input mean</text>',
         '<text x="24" y="56" font-size="13">Node 26.12.0 · o200k_base · 5 fresh processes · lower is better</text>']
for index, (metric, title) in enumerate((('encode', 'Encode'), ('decode', 'Decode API return (length only)'), ('count', 'Count'))):
    # The legacy report owns eligibility, reference exclusions and aggregation.
    contenders = sorted((row for row in rows if row['eligible'] and row['id'] != reference['id']),
                        key=lambda row: row['metrics'][metric]['median'])
    assert contenders[0]['id'] == candidate['id'] and len(contenders) == 10
    other = next(row for row in contenders if row['id'] != candidate['id'])
    selected = [(candidate, 'gpt-tokenizer (checkout)', '#087f6d'),
                (other, other['id'], '#5779a3'),
                (reference, 'gpt-tokenizer 4.0.3 (reference)', '#8591a0')]
    y = 86 + index * 137
    parts.append(f'<text x="24" y="{y}" font-size="15" font-weight="700">{title} · #1 / 10</text>')
    maximum = max(row['metrics'][metric]['median'] for row, _, _ in selected)
    for offset, (row, label, color) in enumerate(selected):
        value = row['metrics'][metric]['median']
        bar_y = y + 13 + offset * 29
        width = 300 * value / maximum
        parts += [f'<text x="24" y="{bar_y + 14}" font-size="12">{html.escape(label)}</text>',
                  f'<rect x="310" y="{bar_y}" width="{width:.3f}" height="19" rx="3" fill="{color}"/>',
                  f'<text x="625" y="{bar_y + 14}" font-size="13">{value:.3f} ms</text>']
parts += ['<text x="24" y="510" font-size="12">Each panel: checkout, fastest other tokenizer, and historical npm reference.</text>',
          '<text x="24" y="532" font-size="12">Synthetic inputs dominate. See linked results for realistic workloads, ranges and losses.</text>', '</g></svg>']
(HERE.parents[1] / 'docs/benchmark-summary.svg').write_text('\n'.join(parts) + '\n')
