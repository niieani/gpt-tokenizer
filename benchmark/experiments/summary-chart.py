"""Generate the README comparison SVG from validated recorded measurements."""
import html
import importlib.util
import json
import math
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
rows = [row for row in legacy.summarize(run, cases, None)['o200k_base']
        if row['eligible'] and row['id'] != 'gpt-tokenizer:npm']
assert len(rows) == 10
research = json.loads((HERE.parent / 'research/2026-10-15.json').read_text())
downloads = {item['package']: item['downloads']['downloads'] for item in research['npm'] if item.get('downloads')}
package = lambda row: 'gpt-tokenizer' if row['id'] == 'gpt-tokenizer:local' else row['id']
assert all(package(row) in downloads for row in rows)
rows.sort(key=lambda row: (row['id'] != 'gpt-tokenizer:local', -downloads[package(row)]))
popular = {row['id'] for row in rows[1:4]}


def adoption(count):
    return f'{count / 1e6:.2f}M' if count >= 1e6 else f'{count / 1e3:.1f}k'


parts = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 1240" role="img" aria-labelledby="title desc">',
         '<title id="title">gpt-tokenizer 4.0.4 versus all ten benchmark contenders</title>',
         '<desc id="desc">Node 26.12.0, o200k_base. Encode, decode API return, and count latency on the original seven-input arithmetic mean. All ten ranked contenders, ordered by package npm downloads after gpt-tokenizer. Five fresh processes; bars show medians, whiskers show full process ranges. Logarithmic latency axes; lower is better. The historical npm reference is excluded. Large synthetic inputs dominate this score; see linked realistic results.</desc>',
         '<rect width="760" height="1240" rx="12" fill="#f5f7fa"/>',
         '<g font-family="system-ui, sans-serif" fill="#172336">',
         '<text x="24" y="32" font-size="20" font-weight="700">#1 on the original seven-input mean</text>',
         '<text x="24" y="56" font-size="13">Node 26.12.0 · o200k_base · five fresh processes · lower is better</text>',
         '<text x="24" y="77" font-size="12">All contenders · ordered by package npm downloads · logarithmic latency axes</text>']
for index, (metric, title) in enumerate((('encode', 'Encode'), ('decode', 'Decode API return (length only)'), ('count', 'Count'))):
    ranked = sorted(rows, key=lambda row: row['metrics'][metric]['median'])
    assert ranked[0]['id'] == 'gpt-tokenizer:local'
    ranks = {row['id']: rank + 1 for rank, row in enumerate(ranked)}
    y = 110 + index * 355
    parts += [f'<text x="24" y="{y}" font-size="16" font-weight="700">{title} · gpt-tokenizer #1 / 10</text>',
              f'<text x="24" y="{y + 26}" font-size="11" fill="#4a586b">Tokenizer / version</text>',
              f'<text x="278" y="{y + 26}" font-size="11" fill="#4a586b" text-anchor="end">npm/week</text>',
              f'<text x="555" y="{y + 26}" font-size="11" fill="#4a586b" text-anchor="end">Latency (log scale)</text>',
              f'<text x="736" y="{y + 26}" font-size="11" fill="#4a586b" text-anchor="end">Median ms · rank</text>']
    low = 10 ** math.floor(math.log10(min(row['metrics'][metric]['min'] for row in rows)))
    high = 10 ** math.ceil(math.log10(max(row['metrics'][metric]['max'] for row in rows)))
    position = lambda value: 304 + 262 * math.log(value / low) / math.log(high / low)
    first, last = y + 44, y + 44 + 9 * 26
    for power in range(round(math.log10(low)), round(math.log10(high)) + 1):
        tick = 10 ** power
        x = position(tick)
        parts += [f'<line x1="{x:.2f}" x2="{x:.2f}" y1="{first - 7}" y2="{last + 14}" stroke="#dce2e9"/>',
                  f'<text x="{x:.2f}" y="{last + 32}" text-anchor="middle" font-size="11" fill="#4a586b">{tick:g}</text>']
    for offset, row in enumerate(rows):
        selected = row['id'] == 'gpt-tokenizer:local'
        color = '#087f6d' if selected else '#335e8c' if row['id'] in popular else '#778ba3'
        label = 'gpt-tokenizer 4.0.4' if selected else f"{row['id']} {row['version']}"
        bar_y = first + offset * 26
        stats = row['metrics'][metric]
        x = position(stats['median'])
        minimum, maximum = position(stats['min']), position(stats['max'])
        weight = '700' if selected or row['id'] in popular else '400'
        parts += [f'<text x="24" y="{bar_y + 8}" font-size="12" font-weight="{weight}">{html.escape(label)}</text>',
                  f'<text x="278" y="{bar_y + 8}" font-size="12" text-anchor="end" fill="#4a586b">{adoption(downloads[package(row)])}</text>',
                  f'<rect x="304" y="{bar_y - 6}" width="{x - 304:.2f}" height="18" rx="2" fill="{color}"/>',
                  f'<path d="M{minimum:.2f},{bar_y + 3}H{maximum:.2f} M{minimum:.2f},{bar_y - 2}v10 M{maximum:.2f},{bar_y - 2}v10" fill="none" stroke="#172336" stroke-width="1.2"/>',
                  f'<text x="736" y="{bar_y + 8}" text-anchor="end" font-size="13" font-weight="{weight}">{stats["median"]:.3f} · #{ranks[row["id"]]}</text>']
parts += ['<text x="24" y="1173" font-size="12">Bars: median latency; whiskers: full five-process range. Lower is better.</text>',
          '<text x="24" y="1195" font-size="12">Package npm downloads: Oct 6–12, 2026; adoption is not a performance score.</text>',
          '<text x="24" y="1217" font-size="12">Synthetic inputs dominate. Linked results cover realistic workloads, memory and correctness.</text>', '</g></svg>']
(HERE.parents[1] / 'docs/benchmark-summary.svg').write_text('\n'.join(parts) + '\n')
