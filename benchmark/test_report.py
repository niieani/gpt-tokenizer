"""Checks for publication statistics and eligibility; no timing or network work."""
import unittest
from report import stats, summarize, validate_run, validate_memory_run
from copy import deepcopy
from pathlib import Path
from tempfile import TemporaryDirectory
import hashlib


class ReportTests(unittest.TestCase):
    def test_median_and_full_spread(self):
        self.assertEqual(stats([1, 2, 100]), {'median': 2, 'min': 1, 'max': 100, 'spreadPct': 4950.0})
        self.assertIsNone(stats([0, 0])['spreadPct'])

    def test_wrong_tokens_are_unranked_and_incomplete_runs_rejected(self):
        packages = [{'id': name, 'version': '1', 'encodings': ['cl100k_base', 'o200k_base']}
                    for name in ['correct', 'incorrect', 'gpt-tokenizer:npm']]
        verification, samples = [], []
        for package in packages:
            for enc in package['encodings']:
                verification.append({'id': package['id'], 'encoding': enc, 'checks': [
                    {'dataset': 'input', 'firstDifference': -1 if package['id'] != 'incorrect' else 0,
                     'roundTrip': True, 'count': True}]})
                for i in [1, 2]:
                    mem = dict(heapUsed=1, rss=2, external=3, arrayBuffers=4)
                    samples.append(dict(id=package['id'], encoding=enc, round=i,
                        datasets={'input': {op: dict(ms=i, elapsedMs=300, calls=5) for op in ['encode','decode','count']}},
                        initialization={'ms': i, 'memory': mem}, retained=mem, peakRssMiB=10))
        run = dict(packages=packages, verification=verification, samples=samples,
                   inputs=[dict(name='input', timed=True)], settings=dict(rounds=2, minMs=300),
                   environment=dict(engine='node', engineVersion='test'))
        memory = dict(samples=[dict(s, initialization=s['initialization']['memory'], final=s['retained'], datasets={'input': s['retained']}) for s in samples])
        groups = summarize(run, memory)
        self.assertEqual(groups[0]['rows'][0]['stats']['encode']['rank'], 1)
        self.assertNotIn('rank', groups[0]['rows'][1]['stats']['encode'])
        self.assertNotIn('rank', groups[0]['rows'][2]['stats']['encode'])
        self.assertEqual(groups[0]['rows'][0]['stats']['encode']['median'], 1.5)
        run['samples'].pop()
        with self.assertRaises(AssertionError): summarize(run, memory)

    def test_publication_rejects_missing_checks_smoke_and_invalid_samples(self):
        inputs = [dict(name='input', timed=True)]
        package = dict(id='correct', version='1', encodings=['cl100k_base'])
        mem = dict(heapUsed=1, rss=2, external=3, arrayBuffers=4)
        sample = dict(id='correct', encoding='cl100k_base',
            initialization=dict(ms=10, memory=mem), retained=mem, peakRssMiB=50,
            datasets={'input': {op: dict(ms=60, calls=5, elapsedMs=300) for op in ['encode','decode','count']}})
        run = dict(finishedAt='done', errors=[], packages=[package], inputs=inputs,
            settings=dict(rounds=5, minMs=300),
            verification=[dict(id='correct', encoding='cl100k_base', checks=[
                dict(dataset='input', firstDifference=-1, roundTrip=True, count=True)])],
            samples=[dict(deepcopy(sample), round=i) for i in range(1,6)])
        validate_run(run)
        def missing_checks(r): r['verification'][0]['checks'].clear()
        def duplicate_checks(r): r['verification'][0]['checks'] *= 2
        def smoke(r): r['settings']['minMs'] = 10
        def bad_round(r): r['samples'][0]['round'] = 99
        def nan(r): r['samples'][0]['initialization']['ms'] = float('nan')
        def duration(r): r['samples'][0]['datasets']['input']['encode']['elapsedMs'] = 299
        def missing_op(r): del r['samples'][0]['datasets']['input']['encode']
        for mutate in [missing_checks, duplicate_checks, smoke, bad_round, nan, duration, missing_op]:
            with self.subTest(mutate=mutate.__name__):
                broken = deepcopy(run)
                mutate(broken)
                with self.assertRaises(AssertionError): validate_run(broken)

    def test_memory_provenance_settlement_and_deltas(self):
        env = dict(engine='node', engineVersion='26.12.0', hostname='test', platform='linux', arch='x64', kernel='test')
        inp = dict(name='input', timed=True)
        packages = [dict(id='correct', encodings=['cl100k_base'])]
        timing = dict(environment=env, inputs=[inp], packages=packages)
        snap = dict(heapUsed=1048576, rss=1048576, external=1048576, arrayBuffers=1048576)
        zero = dict.fromkeys(snap, 0)
        sample = dict(id='correct', encoding='cl100k_base', baseline=snap, initialized=snap, final=snap,
                      initialization=zero, retained=zero, datasets={'input': zero}, peakRssMiB=1, checksum=3)
        with TemporaryDirectory() as temp:
            path = Path(temp)/'timing.json'; path.write_text('timing-file')
            memory = dict(finishedAt='done', errors=[], protocol='settled-one-pass-v1', settings=dict(rounds=5, passes=1, operations=['encode','decode','count']),
                          inputs=[inp], packages=packages, environment=env, productionSourceUnchanged=True,
                          timingSha256=hashlib.sha256(path.read_bytes()).hexdigest(), expectedChecksums={'cl100k_base':3},
                          samples=[dict(deepcopy(sample), round=i) for i in range(1,6)])
            validate_memory_run(memory, timing, path)
            def checksum(r): r['samples'][0]['checksum'] = 0
            def delta(r): r['samples'][0]['retained']['heapUsed'] = 1
            def provenance(r): r['timingSha256'] = 'wrong'
            def missing(r): r['samples'].pop()
            for mutate in [checksum, delta, provenance, missing]:
                broken=deepcopy(memory); mutate(broken)
                with self.subTest(mutate=mutate.__name__):
                    with self.assertRaises(AssertionError): validate_memory_run(broken, timing, path)


if __name__ == '__main__': unittest.main()
