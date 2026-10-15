"""Generate published tables, charts and an inline review from recorded samples.

Run: python3 -m venv .venv && .venv/bin/pip install -r requirements-report.txt
     .venv/bin/python report.py
This script never runs benchmarks or contacts the network.
"""
import hashlib
import html
import json
import math
from pathlib import Path
from statistics import mean, median

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
FILES = ['node-26.12.0.json', 'bun-1.4.3.json']
MEMORY_FILES = ['memory-' + file for file in FILES]
OPS = ['encode', 'decode', 'count']
LOCAL = 'gpt-tokenizer:local'

def ranked(row):
    return row['eligible'] and row['id'] != 'gpt-tokenizer:npm'


def stats(values):
    middle = median(values)
    return dict(median=middle, min=min(values), max=max(values),
                spreadPct=(max(values) - min(values)) / abs(middle) * 100 if middle else None)


def correct(check):
    return check['firstDifference'] == -1 and check['roundTrip'] and check['count'] and not check.get('error')


def validate_run(run):
    assert run['finishedAt'] and not run['errors'], 'Incomplete or failed run'
    assert run['settings']['rounds'] == 5 and run['settings']['minMs'] >= 300, 'Insufficient publication budget'
    ids = [p['id'] for p in run['packages']]
    assert len(ids) == len(set(ids)), 'Duplicate package ID'
    cases = {(p['id'], enc) for p in run['packages'] for enc in p['encodings']}
    inputs = [i['name'] for i in run['inputs']]
    assert len(inputs) == len(set(inputs)), 'Duplicate input'
    timed = {i['name'] for i in run['inputs'] if i['timed']}
    checks = run['verification']
    assert len(checks) == len(cases) and {(c['id'], c['encoding']) for c in checks} == cases, 'Verification case coverage'
    for check in checks:
        names = [c['dataset'] for c in check['checks']]
        assert len(names) == len(inputs) and set(names) == set(inputs), 'Missing or duplicate correctness checks'
    for case in cases:
        samples = [s for s in run['samples'] if (s['id'], s['encoding']) == case]
        assert len(samples) == run['settings']['rounds'], 'Sample count'
        assert {s['round'] for s in samples} == set(range(1, run['settings']['rounds']+1)), 'Invalid rounds'
    assert len(run['samples']) == len(cases) * run['settings']['rounds'], 'Extra sample cases'
    for s in run['samples']:
        assert set(s['datasets']) == timed, 'Timed dataset coverage'
        assert math.isfinite(s['initialization']['ms']) and s['initialization']['ms'] >= 0, 'Invalid load latency'
        assert math.isfinite(s['peakRssMiB']) and s['peakRssMiB'] > 0, 'Invalid peak RSS'
        for mem in [s['initialization']['memory'], s['retained']]:
            assert set(mem) == {'heapUsed', 'rss', 'external', 'arrayBuffers'}, 'Memory metric coverage'
            assert all(math.isfinite(v) for v in mem.values()), 'Invalid memory value'
        for timings in s['datasets'].values():
            assert set(timings) == set(OPS), 'Operation coverage'
            for t in timings.values():
                assert math.isfinite(t['ms']) and t['ms'] > 0, 'Invalid operation latency'
                assert isinstance(t['calls'], int) and t['calls'] >= 5, 'Insufficient calls'
                assert math.isfinite(t['elapsedMs']) and t['elapsedMs'] >= run['settings']['minMs'], 'Insufficient duration'
                assert math.isclose(t['ms'] * t['calls'], t['elapsedMs'], rel_tol=1e-9), 'Inconsistent timing'


def validate_memory_run(memory, timing, timing_path):
    assert memory['finishedAt'] and not memory['errors'], 'Incomplete memory phase'
    assert memory['protocol'] == 'settled-one-pass-v1', 'Unknown memory protocol'
    assert memory['settings']['rounds'] == 5 and memory['settings']['passes'] == 1, 'Memory budget'
    assert memory['settings']['operations'] == OPS, 'Memory operation order'
    assert memory['packages'] == timing['packages'], 'Memory package versions differ'
    assert memory['inputs'] == [i for i in timing['inputs'] if i['timed']], 'Memory inputs differ'
    assert memory['productionSourceUnchanged'], 'Tokenizer source changed'
    assert memory['timingSha256'] == hashlib.sha256(timing_path.read_bytes()).hexdigest(), 'Timing provenance changed'
    for key in ['engine', 'engineVersion', 'hostname', 'platform', 'arch', 'kernel']:
        assert memory['environment'][key] == timing['environment'][key], 'Memory environment differs'
    cases = {(p['id'], enc) for p in timing['packages'] for enc in p['encodings']}
    assert len(memory['samples']) == len(cases)*5, 'Memory sample coverage'
    names = {i['name'] for i in memory['inputs']}
    for case in cases:
        samples = [s for s in memory['samples'] if (s['id'], s['encoding']) == case]
        assert len(samples) == 5 and {s['round'] for s in samples} == set(range(1,6)), 'Memory rounds'
        for sample in samples:
            assert set(sample['datasets']) == names, 'Memory dataset coverage'
            for m in [sample['baseline'], sample['initialized'], sample['final'], sample['initialization'], sample['retained']] + list(sample['datasets'].values()):
                assert set(m) == {'heapUsed','rss','external','arrayBuffers'}, 'Memory fields'
                assert all(math.isfinite(v) for v in m.values()), 'Invalid memory measurement'
            assert math.isfinite(sample['peakRssMiB']) and sample['peakRssMiB'] > 0, 'Invalid memory peak'
            assert sample['checksum'] == memory['expectedChecksums'][sample['encoding']], 'Memory workload checksum'
            for key in ['heapUsed','rss','external','arrayBuffers']:
                assert math.isclose(sample['initialization'][key], (sample['initialized'][key]-sample['baseline'][key])/1024**2, abs_tol=1e-9), 'Inconsistent init memory delta'
                assert math.isclose(sample['retained'][key], (sample['final'][key]-sample['initialized'][key])/1024**2, abs_tol=1e-9), 'Inconsistent retained memory delta'


def summarize(run, memory_run):
    datasets = [i['name'] for i in run['inputs'] if i['timed']]
    groups = []
    for encoding in ['cl100k_base', 'o200k_base']:
        rows = []
        for package in run['packages']:
            if encoding not in package['encodings']:
                continue
            samples = [s for s in run['samples'] if s['id'] == package['id'] and s['encoding'] == encoding]
            assert len(samples) == run['settings']['rounds'], (package['id'], encoding, len(samples))
            assert len({s['round'] for s in samples}) == len(samples)
            memory_samples = [s for s in memory_run['samples'] if s['id'] == package['id'] and s['encoding'] == encoding]
            assert len(memory_samples) == len(samples), 'Memory sample count'
            check = next(c for c in run['verification'] if c['id'] == package['id'] and c['encoding'] == encoding)
            names = [c['dataset'] for c in check['checks']]
            assert len(names) == len(run['inputs']) and set(names) == {i['name'] for i in run['inputs']}, 'Missing or duplicate correctness checks'
            verified = all(correct(c) for c in check['checks'] if c['dataset'] in datasets)
            row = dict(id=package['id'], version=package['version'], eligible=verified,
                       probeFailures=[c for c in check['checks'] if c['dataset'] not in datasets and not correct(c)],
                       stats={}, datasets={}, memoryDatasets={})
            for op in OPS:
                row['stats'][op] = stats([mean(s['datasets'][d][op]['ms'] for d in datasets) for s in samples])
            row['stats']['init'] = stats([s['initialization']['ms'] for s in samples])
            for key in ['heapUsed', 'rss', 'external', 'arrayBuffers']:
                row['stats']['init_' + key] = stats([s['initialization'][key] for s in memory_samples])
                row['stats']['retained_' + key] = stats([s['retained'][key] for s in memory_samples])
            row['stats']['final_heapUsed'] = stats([s['final']['heapUsed']/1024**2 for s in memory_samples])
            row['stats']['final_rss'] = stats([s['final']['rss']/1024**2 for s in memory_samples])
            row['stats']['peakRss'] = stats([s['peakRssMiB'] for s in memory_samples])
            row['stats']['timedPeakRss'] = stats([s['peakRssMiB'] for s in samples])
            for d in datasets:
                row['memoryDatasets'][d] = {key: stats([s['datasets'][d][key] for s in memory_samples]) for key in ['heapUsed','rss','external','arrayBuffers']}
                row['datasets'][d] = {op: stats([s['datasets'][d][op]['ms'] for s in samples]) for op in OPS}
                for s in samples:
                    for op in OPS:
                        timing = s['datasets'][d][op]
                        assert timing['calls'] >= 5 and timing['elapsedMs'] >= run['settings']['minMs']
            rows.append(row)
        for space in ['stats'] + datasets:
            get = lambda row: row['stats'] if space == 'stats' else row['datasets'][space]
            for metric in get(rows[0]):
                if metric == 'timedPeakRss': continue  # adaptive timing loops allocate different volumes
                eligible = sorted([r for r in rows if ranked(r)], key=lambda r: get(r)[metric]['median'])
                for rank, row in enumerate(eligible, 1):
                    get(row)[metric]['rank'] = rank
        groups.append(dict(engine=run['environment']['engine'], version=run['environment']['engineVersion'],
                           encoding=encoding, rows=rows, datasets=datasets))
    return groups


def cell(s, precision=3):
    return f"{s['median']:.{precision}f} [{s['min']:.{precision}f}–{s['max']:.{precision}f}]"


def name(row):
    suffix = ' †' if row['probeFailures'] else ''
    suffix += ' **MISMATCH**' if not row['eligible'] else ''
    return row['id'] + suffix


def table(headers, rows):
    return '\n'.join(['| ' + ' | '.join(headers) + ' |', '| ' + ' | '.join(['---'] * len(headers)) + ' |'] +
                     ['| ' + ' | '.join(map(str, row)) + ' |' for row in rows])


def markdown(groups, runs, memory_runs):
    out = ['<!-- Generated by benchmark/report.py; regenerate with python3 report.py. -->',
           '# Benchmark results — 2026-10-15 UTC', '',
           'Five independent timing samples and five separate settled-memory samples per tokenizer, encoding, and engine on `benchmark-vm`. '
           'Values are **median [minimum–maximum]**, lower is better. Latency is ms/call; memory is MiB. '
           'See [methodology and selection](README.md). † marks an extra-probe limitation; all timed inputs '
           'must match to receive a rank. The npm gpt-tokenizer row is an unranked reference, not a second competitor. These are warm repeated-input measurements, not unique-document throughput.', '']
    for run, file in zip(runs, FILES):
        e = run['environment']
        out += [f"- [{e['engine']} {e['engineVersion']} raw samples](results/{file}): "
                f"{len(run['samples'])} samples, {len(run['errors'])} worker errors; "
                f"{run['startedAt']} → {run['finishedAt']}; "
                f"source `{e['gitCommit']}`; raw SHA-256 `{hashlib.sha256((HERE/'results'/file).read_bytes()).hexdigest()}`."]
    out += ['', 'Memory comes from a separate **settled, one-pass phase**: two event-loop/GC turns before baseline and after load; one encode/decode/count pass per input; released outputs and settled GC before retained snapshots. Original timing-phase memory snapshots contain transient loader roots and are superseded for initialization/retained rankings. Timed-workload peak RSS remains separately labeled, since it reflects different allocation/JIT pressure.', '']
    for memory, file in zip(memory_runs, MEMORY_FILES):
        out += [f"- [Settled {memory['environment']['engine']} memory raw samples](results/{file}): {len(memory['samples'])} samples, {len(memory['errors'])} errors; source `{memory['environment']['gitCommit']}`; SHA-256 `{hashlib.sha256((HERE/'results'/file).read_bytes()).hexdigest()}`."]
    e = runs[0]['environment']
    out += ['', f"Host: {e['hostname']}, {e['platform']} {e['arch']}, kernel {e['kernel']}, "
            f"{len(e['cpus'])} virtual CPUs presenting {e['cpus'][0]['model']}, "
            f"{e['totalMemoryGiB']:.1f} GiB RAM. KVM VM; shared-host scheduling/turbo and JIT/GC affect results. "
            'No CPU pinning or frequency control was applied. Runtime-specific native APIs are included.', '',
            '## Local checkout ranks', '']
    metrics = [('encode', 'Encode'), ('decode', 'Decode'), ('count', 'Count'), ('init', 'Load'),
               ('init_heapUsed', 'Init heap'), ('init_rss', 'Init RSS'),
               ('retained_heapUsed', 'One-pass retained heap'), ('retained_rss', 'One-pass retained RSS'), ('final_heapUsed', 'Final heap'), ('final_rss', 'Final RSS'), ('peakRss', 'One-pass peak RSS')]
    out += [table(['Case'] + [g['engine'] + ' / ' + g['encoding'] for g in groups],
                  [[label] + [str(next(r for r in g['rows'] if r['id'] == LOCAL)['stats'][key].get('rank', 'unranked')) + '/' +
                              str(sum(ranked(r) for r in g['rows'])) for g in groups] for key, label in metrics]), '']
    for g in groups:
        out += [f"## {g['engine']} {g['version']} — {g['encoding']}", '',
                'Seven-input arithmetic mean latency, then median and range across runs. Rank follows the median; '
                'overlapping ranges warrant caution.', '',
                table(['Tokenizer', 'Version', 'Encode ms', 'Decode ms', 'Count ms', 'Load ms'],
                      [[name(r), r['version']] + [cell(r['stats'][m]) for m in OPS + ['init']] for r in g['rows']]), '',
                'Settled initialization deltas and retained growth after one workload pass. Final and peak RSS are absolute process memory including the harness/corpus; the timed-loop peak is preserved separately and is not ranked.', '',
                table(['Tokenizer', 'Init RSS delta', 'One-pass retained RSS', 'Final RSS', 'One-pass peak RSS', 'Timed-loop peak RSS'],
                      [[name(r)] + [cell(r['stats'][m], 2) for m in ['init_rss','retained_rss','final_rss','peakRss','timedPeakRss']] for r in g['rows']]), '',
                table(['Tokenizer', 'Init heap delta', 'One-pass retained heap', 'Final heap', 'Init external delta', 'Init buffers delta'],
                      [[name(r)] + [cell(r['stats'][m], 2) for m in ['init_heapUsed','retained_heapUsed','final_heapUsed','init_external','init_arrayBuffers']] for r in g['rows']]), '']
        out += ['<details>', '<summary>Per-input encode / decode / count latency and local ranks</summary>', '']
        for d in g['datasets']:
            local = next(r for r in g['rows'] if r['id'] == LOCAL)
            ranks = ', '.join(f"{op} #{local['datasets'][d][op].get('rank', 'unranked')}" for op in OPS)
            out += [f'### {d} — local {ranks}', '',
                    table(['Tokenizer', 'Encode ms', 'Decode ms', 'Count ms', 'Cumulative retained heap MiB', 'Cumulative retained RSS MiB'],
                          [[name(r)] + [cell(r['datasets'][d][m], 5) for m in OPS] + [cell(r['memoryDatasets'][d][m], 2) for m in ['heapUsed','rss']] for r in g['rows']]), '']
        out += ['</details>', '']
    out += ['## Correctness', '', 'All timed inputs were checked against the checkout token-for-token, with decode and count checks. '
            'Extra probes are reported separately and do not alter the workload being timed.', '']
    failures = []
    for run in runs:
        for c in run['verification']:
            for check in c['checks']:
                if not correct(check):
                    failures.append([run['environment']['engine'], c['id'], c['encoding'], check['dataset'],
                                     f"{check['tokens']}/{check['actualTokens']}", check['firstDifference'],
                                     str(check.get('expectedToken', '—')) + '/' + str(check.get('actualToken', '—')),
                                     check['roundTrip'], check['count'], check.get('error', '—')])
    out += [table(['Engine','Tokenizer','Encoding','Input','Expected/actual count','First different index','Expected/actual ID','Round trip','Count','Error'], failures), '']
    if (HERE/'FINDINGS.md').exists():
        out += [(HERE/'FINDINGS.md').read_text(), '']
    return '\n'.join(out).rstrip() + '\n'


def charts(groups):
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    plt.rcParams.update({'font.size': 9, 'axes.spines.top': False, 'axes.spines.right': False})
    for kind, keys, title, filename in [
        ('latency', OPS, 'Seven-input mean latency · median and full range · lower is better', 'fastest.png'),
        ('memory', ['init_heapUsed','init_rss'], 'Settled initialization memory delta · median and full range · lower is better', 'lowest-footprint.png'),
        ('load', ['init'], 'Fresh-process module load + encoding construction · median and full range', 'initialization.png'),
    ]:
        fig, axes = plt.subplots(4, 1, figsize=(9, 24))
        for ax, g in zip(axes.flat, groups):
            rows = g['rows']
            labels = [r['id'] + (' †' if r['probeFailures'] else '') + (' [MISMATCH / unranked]' if not r['eligible'] else '') for r in rows]
            height = .72 / len(keys)
            for j, metric in enumerate(keys):
                values = [r['stats'][metric] for r in rows]
                y = [i + (j - (len(keys)-1)/2) * height for i in range(len(rows))]
                ax.barh(y, [v['median'] for v in values], height=height * .9,
                        xerr=[[max(0, v['median']-v['min']) for v in values],
                              [max(0, v['max']-v['median']) for v in values]],
                        capsize=2, label=metric.replace('init_', 'init ').replace('heapUsed', 'heap'), alpha=.9)
            ax.set_yticks(range(len(rows)), labels)
            ax.invert_yaxis()
            if kind != 'memory': ax.set_xscale('log')
            ax.set_xlabel('MiB' if kind == 'memory' else 'ms (log scale)')
            ax.set_title(f"{g['engine']} {g['version']} · {g['encoding']}")
            ax.grid(axis='x', alpha=.2)
            ax.legend(loc='lower right', fontsize=8)
            ax.get_yticklabels()[0].set_fontweight('bold')
        fig.suptitle(title + '\nNode 26.12.0 / Bun 1.4.3 · benchmark-vm KVM · 5 independent runs · † probe limitation', fontsize=13)
        fig.tight_layout(rect=(0,0,1,.96))
        fig.savefig(ROOT/'docs'/filename, dpi=180, metadata={'Software':'benchmark/report.py (matplotlib 3.11.2)'})
        plt.close(fig)


def interactive(groups):
    visible_keys = ['encode','decode','count','init','init_heapUsed','init_rss','retained_heapUsed','retained_rss','final_heapUsed','final_rss','peakRss']
    compact = lambda stat: {k: v for k, v in stat.items() if k in ['median','min','max','rank']}
    display_groups = [{**g, 'rows': [{**{k:v for k,v in r.items() if k not in ['stats','datasets','memoryDatasets']},
        'stats': {k: compact(v) for k,v in r['stats'].items() if k in visible_keys},
        'datasets': {d: {k: compact(v) for k,v in ops.items()} for d,ops in r['datasets'].items()}} for r in g['rows']]} for g in groups]
    data = json.dumps(display_groups).replace('<', '\\u003c')
    # Selection/skip tables are maintained once, in the methodology README.
    selection, skipped = [], []
    for line in (HERE/'README.md').read_text().splitlines():
        if line.startswith('|'):
            cells = [c.strip() for c in line.strip('|').split('|')]
            if all(c.replace('-', '').strip() == '' for c in cells): continue
            tag = 'th' if cells[0] in ['Package','Candidate'] else 'td'
            rendered = [html.escape(c).replace('**', '').replace('`', '') for c in cells]
            if len(cells) == 3 and tag == 'td':
                release = cells[1].split()[-1]
                rendered[0] = '<a href="https://registry.npmjs.org/'+html.escape(cells[0])+'/'+html.escape(release)+'" target="_blank" rel="noreferrer" title="Pinned npm release metadata">'+rendered[0]+'</a>'
            row = '<tr>' + ''.join('<'+tag+'>' + c + '</'+tag+'>' for c in rendered) + '</tr>'
            (selection if len(cells) == 3 else skipped).append(row)
    findings = ''.join('<p>' + html.escape(p).replace('`', '') + '</p>' for p in (HERE/'FINDINGS.md').read_text().split('\n\n') if p and not p.startswith('#')) if (HERE/'FINDINGS.md').exists() else ''
    rank_metrics = [('encode','Encode'),('decode','Decode'),('count','Count'),('init','Load'),('init_heapUsed','Init heap'),('init_rss','Init RSS'),('retained_heapUsed','One-pass retained heap'),('retained_rss','One-pass retained RSS'),('final_heapUsed','Final heap'),('final_rss','Final RSS'),('peakRss','One-pass peak RSS')]
    overview = '<thead><tr><th>Checkout rank</th>' + ''.join('<th>'+html.escape(g['engine']+' '+g['version'])+'<small>'+g['encoding']+'</small></th>' for g in groups) + '</tr></thead><tbody>'
    for key, label in rank_metrics:
        overview += '<tr><td>'+label+'</td>'
        for g in groups:
            local = next(r for r in g['rows'] if r['id'] == LOCAL)
            rank = local['stats'][key].get('rank','unranked')
            overview += '<td>'+str(rank)+'/'+str(sum(ranked(r) for r in g['rows']))+'</td>'
        overview += '</tr>'
    overview += '</tbody>'
    page = '''<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>
a{color:var(--info,#2563eb)}body{margin:0;color:var(--foreground,#20242b);font-family:var(--font-sans,system-ui);font-size:14px;line-height:1.5}p{color:var(--muted-foreground,#667080)}select{font:inherit;padding:7px;border:1px solid var(--border,#ccd0d8);border-radius:6px;color:inherit;background:var(--card,white);max-width:100%}.controls{display:flex;gap:8px;flex-wrap:wrap;margin:16px 0}.scroll{overflow:auto}table{border-collapse:collapse;width:100%;font-size:12px;font-variant-numeric:tabular-nums}td,th{padding:8px 7px;text-align:left;border-bottom:1px solid var(--border,#ddd);white-space:nowrap}th{color:var(--muted-foreground,#667080);font-weight:500}.local{background:var(--accent-surface,#e5f2ff);font-weight:650}small{display:block;font-weight:400;color:var(--muted-foreground,#667080);font-size:10px}.ranks{display:flex;gap:8px;flex-wrap:wrap}.rank{background:var(--secondary,#f0f2f6);padding:16px;border-radius:var(--radius,8px);flex:1;min-width:105px}.rank strong{font-size:24px;display:block}details{margin:20px 0}summary{cursor:pointer;font-weight:650}.notes{white-space:pre-wrap;font:inherit}h3{font-size:16px;margin:24px 0 8px}.selection td{white-space:normal;vertical-align:top}.selection td:first-child{min-width:150px}button{font:inherit}.warning{color:var(--warning-foreground,#8b4f00)}
</style></head><body>
<p>23 tokenizer/encoding pairs × 5 fresh processes × 2 engines, independently for timing and settled memory, on benchmark-vm KVM (8 vCPUs, Intel i7-1360P, 15.5 GiB). Lower is better. Each value is the median; the full run range appears below it. Defaults: warm repeated input, 100 ms warmup, ≥300 ms and ≥5 calls per operation. Large inputs dominate the seven-input arithmetic mean.</p>
<div class="scroll"><table>OVERVIEW</table></div><p>Ranks compare the checkout with competing implementations; npm 4.0.3 is a separate reference. Overlapping run ranges may be ties in practice.</p>
<div class="controls"><label>Engine <select id="engine"><option>node</option><option>bun</option></select></label><label>Encoding <select id="encoding"><option>cl100k_base</option><option>o200k_base</option></select></label><label>Input <select id="dataset"><option value="mean">Seven-input mean</option></select></label><label>View <select id="view"><option value="speed">Latency</option><option value="memory">Memory</option></select></label></div>
<div class="ranks" id="ranks"></div><p id="context"></p><div class="scroll"><table><thead id="head"></thead><tbody id="rows"></tbody></table></div>
<h3>Correctness</h3><p id="verification-summary"></p><div id="correctness"></div>
<h3>Findings and limits</h3><div class="notes">FINDINGS</div>
<details><summary>Versions, additions and skipped contenders</summary><p>Registry and repository checks: 2026-10-15 UTC. None of the original packages is npm-deprecated. Inactivity and unsupported encodings are recorded separately.</p><div class="scroll">SELECTION</div></details>
<script>const groups=DATA;
const fmt=v=>Number(v).toFixed(Math.abs(v)<.01?6:Math.abs(v)<1?4:3);
const $=id=>document.getElementById(id);const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
for(const d of groups[0].datasets){const o=document.createElement('option');o.value=d;o.textContent=d;$('dataset').append(o)}
function render(){const g=groups.find(g=>g.engine===$('engine').value&&g.encoding===$('encoding').value),mem=$('view').value==='memory',d=$('dataset').value;
const cols=mem?[['init_heapUsed','Init heap'],['init_rss','Init RSS'],['retained_heapUsed','One-pass retained heap'],['retained_rss','One-pass retained RSS'],['final_rss','Final RSS'],['peakRss','One-pass peak RSS']]:[['encode','Encode'],['decode','Decode'],['count','Count'],['init','Load']];
$('dataset').disabled=mem;
const get=(r,k)=>d!=='mean'&&['encode','decode','count'].includes(k)?r.datasets[d][k]:r.stats[k];const local=g.rows.find(r=>r.id==='gpt-tokenizer:local');
$('ranks').innerHTML=cols.map(([k,label])=>`<div class="rank">gpt-tokenizer · ${label}<strong>${get(local,k).rank?'#'+get(local,k).rank:'unranked'}<small>of ${g.rows.filter(r=>r.eligible&&r.id!=='gpt-tokenizer:npm').length}</small></strong></div>`).join('');
$('context').textContent=`${g.engine} ${g.version} · ${g.encoding} · ${mem?'MiB (settled init / one-pass retained deltas; final and peak absolute)':'ms/call'} · ranks exclude the npm gpt-tokenizer reference; overlapping ranges may be ties in practice.`;
$('head').innerHTML='<tr><th>Tokenizer / version</th>'+cols.map(([k,label])=>'<th>'+label+'</th>').join('')+'</tr>';
$('rows').innerHTML=g.rows.map(r=>`<tr class="${r.id==='gpt-tokenizer:local'?'local':''}"><td>${esc(r.id)}${r.probeFailures.length?' †':''}${!r.eligible?' MISMATCH / unranked':''}<small>${esc(r.version)}</small></td>`+cols.map(([k])=>{const s=get(r,k);return `<td>${fmt(s.median)} <small>[${fmt(s.min)}–${fmt(s.max)}] · ${s.rank?'#'+s.rank:r.id==='gpt-tokenizer:npm'?'reference':'unranked'}</small></td>`}).join('')+'</tr>').join('');
$('verification-summary').textContent=(g.rows.every(r=>r.eligible)?'All timed inputs in this group match token IDs, decode and count.':'MISMATCH: some timed inputs differ; affected entries are unranked.')+' † flags a failure on an extra probe.';
$('correctness').innerHTML=g.rows.filter(r=>r.probeFailures.length).map(r=>'<p class="warning">'+esc(r.id)+': '+r.probeFailures.map(p=>esc(p.dataset)+': '+(p.error?esc(p.error):`${p.tokens} expected / ${p.actualTokens} actual tokens; first difference at ${p.firstDifference}, ID ${p.expectedToken} → ${p.actualToken}; round trip ${p.roundTrip}; count ${p.count}`)).join('; ')+'</p>').join('');}
for(const id of ['engine','encoding','dataset','view'])$(id).onchange=render;render();
for(const g of groups){console.assert(g.rows.length===(g.encoding==='cl100k_base'?12:11),'coverage',g.engine,g.encoding);$('engine').value=g.engine;$('encoding').value=g.encoding;for(const view of ['speed','memory']){ $('view').value=view;for(const d of ['mean',...g.datasets]){$('dataset').value=d;render();console.assert($('rows').children.length===g.rows.length,'table row coverage')}}} $('engine').value='node';$('encoding').value='cl100k_base';$('dataset').value='mean';$('view').value='speed';render();console.log('Validated 4 engine/encoding groups and all 64 table-control states');
</script></body></html>'''
    return page.replace('DATA', data).replace('SELECTION', '<table class="selection">'+''.join(selection)+'</table><p>Skipped candidates</p><table class="selection">'+''.join(skipped)+'</table>').replace('FINDINGS', findings).replace('OVERVIEW', overview)


if __name__ == '__main__':
    runs = [json.loads((HERE/'results'/file).read_text()) for file in FILES]
    for run, expected in zip(runs, [('node', '26.12.0'), ('bun', '1.4.3')]):
        validate_run(run)
        assert (run['environment']['engine'], run['environment']['engineVersion']) == expected, 'Mislabeled engine/version'
    assert runs[0]['environment']['gitCommit'] == runs[1]['environment']['gitCommit'], 'Different source revisions'
    assert runs[0]['packages'] == runs[1]['packages'], 'Different package versions'
    assert runs[0]['settings'] == runs[1]['settings'], 'Different benchmark budgets'
    assert runs[0]['inputs'] == runs[1]['inputs'], 'Engines used different inputs'
    memory_runs = [json.loads((HERE/'results'/file).read_text()) for file in MEMORY_FILES]
    for memory, timing, file in zip(memory_runs, runs, FILES): validate_memory_run(memory, timing, HERE/'results'/file)
    groups = [g for run, memory in zip(runs, memory_runs) for g in summarize(run, memory)]
    (HERE/'RESULTS.md').write_text(markdown(groups, runs, memory_runs))
    (HERE/'results'/'summary.json').write_text(json.dumps(groups, indent=2)+'\n')
    charts(groups)
    (HERE/'results'/'review.html').write_text(interactive(groups))
    print('Wrote RESULTS.md, summary.json, review.html and three docs charts')
