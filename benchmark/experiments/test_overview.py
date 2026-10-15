import copy
import hashlib
import importlib.util
import json
import math
import subprocess
import sys
from pathlib import Path
import tempfile
import unittest

SPEC = importlib.util.spec_from_file_location('overview', Path(__file__).with_name('overview.py'))
overview = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(overview)


def sha(text):
    return hashlib.sha256(text.encode()).hexdigest()


def fixture():
    categories = ['prose', 'code', 'structured', 'multilingual', 'long-prose', 'long-code', 'long-structured']
    documents = [{'id': category, 'category': category, 'utf8Bytes': 500,
                  'sha256': sha(category), 'streamSha256': [sha(f'{category}:{index}') for index in range(32)]}
                 for category in categories]
    configuration = dict(consume='length', rounds=5, minMs=100, warmMs=50, warmCalls=20,
                         operations=['encode', 'decode', 'count'], modes=['repeated', 'stream'],
                         entries=['baseline', 'candidate', 'competitor'], encoding='o200k_base', legacy=False)
    memory = dict(heapUsed=1000, rss=10000, external=500, arrayBuffers=0)
    def timing(ms):
        return dict(ms=ms, calls=1000, elapsedMs=ms * 1000)
    samples = []
    for round_id in range(5):
        for entry in configuration['entries']:
            measurements = []
            for document in documents:
                for mode in configuration['modes']:
                    for operation in configuration['operations']:
                        ms = {'baseline': dict(encode=1, decode=1, count=1),
                              'candidate': dict(encode=.5, decode=1.5, count=.25),
                              'competitor': dict(encode=.4, decode=.5, count=.5)}[entry][operation]
                        ms *= [.9, 1, 1.05, 1.1, 1.2][round_id]
                        measurements.append(dict(id=document['id'], category=document['category'], mode=mode,
                                                 operation=operation, warmup=timing(ms), **timing(ms)))
            samples.append(dict(entry=entry, round=round_id, runtime=dict(node='v26.12.0', bun=None),
                                checksum=1000, initializationMs=50, before=memory, initialized=memory,
                                afterFirstPass=memory, firstPass=[dict(id=d['id'], encodeMs=1, decodeMs=1, countMs=1) for d in documents],
                                semanticProbes=[dict(text='', ids=True, count=True, roundTrip=True)],
                                verification=dict(passed=True, reference='tiktoken', documents=7, inputs=231),
                                measurements=measurements))
    return dict(schema=1, complete=True, exploratory=False, configuration=configuration,
                runtime=dict(executable='/node', version='v26.12.0', bun=None, platform='linux', arch='x64'),
                startedAt='2026-10-15T00:00:00Z', completedAt='2026-10-15T01:00:00Z',
                candidate=dict(gitCommit='a' * 40, dirty='', root='/candidate', files={key: sha(key) for key in ['BytePairEncodingCore.js', 'GptEncoding.js', 'encoding/o200k_base.js']}),
                baseline=dict(package='gpt-tokenizer', version='4.0.3'),
                harness={key: sha(key) for key in ['run.mjs', 'worker.mjs', 'protocol.mjs']},
                packages=dict(tiktoken='1.0.22', competitor='1.0.0'),
                hardware=dict(hostname='benchmark-vm', loadStart=[0, 0, 0], loadEnd=[0, 0, 0], cpus=[dict(model='VM CPU', speed=0)], memoryBytes=2**30, release='Linux'),
                corpus=dict(sha256=sha('corpus'), version=2, provenance='synthetic validation fixture', documents=documents),
                samples=samples)


class OverviewTests(unittest.TestCase):
    def test_paired_category_scores_and_unranked_baseline(self):
        run = fixture()
        values, documents = overview.validate(run)
        self.assertEqual(overview.category_score(run, values, documents, 'candidate', 'code', 'stream', 'encode'), 2)
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'input.json'
            path.write_text(json.dumps(run))
            text = overview.render([path])
        self.assertIn('#2/2; 2.00× npm; competitor; 1.25× C/L', text)
        self.assertIn('#1/2; 4.00× npm; candidate; 1.00× C/L', text)
        self.assertNotIn('#3/3', text)
        self.assertIn('| long-structured | stream |', text)
        # Only decode regresses: all seven documents, both modes are listed.
        ledger = text.split('### Loss ledger versus npm')[1].split('### Correctness probes')[0]
        self.assertEqual(ledger.count('| decode |'), 14)
        self.assertNotIn('| encode |', ledger)
        self.assertIn('525.000 | 1.500×', ledger)

    def test_category_weighting_is_per_document_not_by_input_latency(self):
        run = fixture()
        values, documents = overview.validate(run)
        documents['code']['category'] = 'prose'
        for round_id in range(5):
            for identifier, baseline, candidate in [('prose', 100, 50), ('code', 1, 4)]:
                values[('baseline', round_id, identifier, 'stream', 'encode')] = baseline
                values[('candidate', round_id, identifier, 'stream', 'encode')] = candidate
        self.assertAlmostEqual(overview.category_score(run, values, documents, 'candidate', 'prose', 'stream', 'encode'), math.sqrt(.5))

    def test_cli_rejects_exploratory_without_creating_publication(self):
        run = fixture()
        run['exploratory'] = True
        with tempfile.TemporaryDirectory() as directory:
            source, output = Path(directory) / 'pilot.json', Path(directory) / 'published.md'
            source.write_text(json.dumps(run))
            result = subprocess.run([sys.executable, str(Path(__file__).with_name('overview.py')), str(source), '--output', str(output)], capture_output=True, text=True)
            self.assertNotEqual(result.returncode, 0)
            self.assertIn('Exploratory runs cannot be published', result.stderr)
            self.assertFalse(output.exists())

    def test_exploratory_partial_and_underbudget_rejected(self):
        mutations = [lambda r: r.update(exploratory=True), lambda r: r.update(complete=False),
                     lambda r: r['configuration'].update(rounds=4),
                     lambda r: r['configuration'].update(minMs=99),
                     lambda r: r['configuration'].update(warmMs=49),
                     lambda r: r['configuration'].update(warmCalls=19),
                     lambda r: r['configuration'].update(consume='unknown')]
        for mutation in mutations:
            with self.subTest(mutation=mutation):
                run = fixture()
                mutation(run)
                with self.assertRaises(ValueError):
                    overview.validate(run)

    def test_exact_coverage_runtime_and_timing_fail_closed(self):
        mutations = [lambda r: r['samples'].pop(),
                     lambda r: r['samples'][0]['measurements'].pop(),
                     lambda r: r['samples'][0]['measurements'].append(copy.deepcopy(r['samples'][0]['measurements'][0])),
                     lambda r: r['samples'][0].update(round=1),
                     lambda r: r['samples'][0]['runtime'].update(node='v26.7.0'),
                     lambda r: r['samples'][0]['verification'].update(inputs=230),
                     lambda r: r['samples'][0]['measurements'][0].update(ms=float('nan')),
                     lambda r: r['samples'][0]['measurements'][0].update(calls=float('inf')),
                     lambda r: r['samples'][0]['measurements'][0].update(elapsedMs=123),
                     lambda r: r['samples'][0]['measurements'][0]['warmup'].update(calls=19)]
        for mutation in mutations:
            with self.subTest(mutation=mutation):
                run = fixture()
                mutation(run)
                with self.assertRaises(ValueError):
                    overview.validate(run)

    def test_provenance_required_and_all_round_probe_failures_reported(self):
        for mutation in [lambda r: r['candidate'].update(gitCommit='unknown'),
                         lambda r: r['candidate']['files'].update({'GptEncoding.js': 'bad'}),
                         lambda r: r['harness'].pop('worker.mjs'),
                         lambda r: r['corpus']['documents'][0]['streamSha256'].pop(),
                         lambda r: r['corpus'].update(sha256='bad'),
                         lambda r: r['hardware'].update(hostname=''),
                         lambda r: r['hardware'].update(loadStart=[0, 0]),
                         lambda r: r['hardware'].update(loadEnd=[float('nan'), 0, 0])]:
            run = fixture()
            mutation(run)
            with self.assertRaises(ValueError):
                overview.validate(run)
        run = fixture()
        # A failure outside round0 must still be published.
        sample = next(s for s in run['samples'] if s['entry'] == 'candidate' and s['round'] == 3)
        sample['semanticProbes'][0]['roundTrip'] = False
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'input.json'
            path.write_text(json.dumps(run))
            output = overview.render([path])
        self.assertIn('`candidate` rounds 4:', output)
        self.assertIn('"roundTrip": false', output)
        self.assertIn('executed-build manifest SHA-256', output)


if __name__ == '__main__':
    unittest.main()
