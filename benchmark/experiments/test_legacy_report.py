"""Fail-closed publication checks using tiny fabricated evidence, no timings."""
from copy import deepcopy
import importlib.util
import json
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest

spec = importlib.util.spec_from_file_location('legacy_report', Path(__file__).with_name('legacy-report.py'))
report = importlib.util.module_from_spec(spec)
spec.loader.exec_module(report)


def fixture():
    inputs = [dict(name=name, timed=name in report.TIMED, bytes=1, sha256='a' * 64)
              for name in sorted(report.TIMED | report.PROBES)]
    packages = [dict(id=id_, version='1.0', encodings=['cl100k_base', 'o200k_base'])
                for id_ in [report.LOCAL, report.REFERENCE, 'wrong', 'not-selected']]
    verification, samples, memory_samples = [], [], []
    for id_, latency in [(report.LOCAL, 80), (report.REFERENCE, 70), ('wrong', 60)]:
        checks = [dict(dataset=i['name'], tokens=2, actualTokens=2, firstDifference=0 if id_ == 'wrong' and i['name'] == 'English' else -1,
                       roundTrip=True, count=True) for i in inputs]
        if id_ == report.REFERENCE:
            next(c for c in checks if c['dataset'] == 'LeadingBOM')['roundTrip'] = False
        verification.append(dict(id=id_, encoding='o200k_base', checks=checks, passed=all(report.correct(c) for c in checks)))
        for round_ in range(1, 6):
            timing = dict(ms=latency, calls=5, elapsedMs=latency * 5,
                          warmup=dict(ms=10, calls=10, elapsedMs=100))
            zero = dict.fromkeys(report.MEM, 0)
            absolute = lambda size: dict.fromkeys(report.MEM, size * 2**20)
            samples.append(dict(id=id_, encoding='o200k_base', round=round_, checksum=0, peakRssMiB=4,
                                initialization=dict(ms=10, memory=zero), retained=zero,
                                datasets={name: {op: deepcopy(timing) for op in report.OPS} for name in report.TIMED}))
            memory_samples.append(dict(id=id_, encoding='o200k_base', round=round_, checksum=17, peakRssMiB=4,
                                       baseline=absolute(1), initialized=absolute(2), final=absolute(3),
                                       initialization=dict.fromkeys(report.MEM, 1), retained=dict.fromkeys(report.MEM, 1),
                                       datasets={name: dict.fromkeys(report.MEM, 1) for name in report.TIMED}))
    run = dict(schema=1, finishedAt='done', errors=[], inputs=inputs, packages=packages,
               verification=verification, samples=samples,
               candidateBuild={name: 'b' * 64 for name in ['BytePairEncodingCore.js', 'GptEncoding.js', 'encoding/o200k_base.js']},
               settings=dict(rounds=5, minMs=300, warmupMs=100, warmupMinimumCalls=5, minimumCalls=5),
               environment=dict(engine='node', engineVersion='26.12.0', hostname='VM', platform='linux', arch='x64', kernel='test', executable='/node', gitCommit='source', gitDiffSha256='c' * 64))
    memory = dict(schema=1, finishedAt='done', errors=[], protocol='settled-one-pass-v1',
                  candidateBuild=deepcopy(run['candidateBuild']), packages=deepcopy(packages),
                  environment=deepcopy(run['environment']), settings=dict(rounds=5, passes=1, operations=list(report.OPS)),
                  inputs=[deepcopy(i) for i in inputs if i['timed']], productionSourceUnchanged=True,
                  timingSourceCommit='source', expectedChecksums={'o200k_base': 17}, samples=memory_samples)
    return run, memory


class LegacyReportTests(unittest.TestCase):
    def test_scoped_metadata_and_reference_mismatch_ranking(self):
        run, _ = fixture()
        cases = report.validate_timing(run)
        groups = report.summarize(run, cases)
        self.assertEqual(set(groups), {'o200k_base'})
        rows = {r['id']: r for r in groups['o200k_base']}
        self.assertEqual(rows[report.LOCAL]['metrics']['encode']['rank'], '1/1')
        self.assertNotIn('rank', rows[report.REFERENCE]['metrics']['encode'])
        self.assertNotIn('rank', rows['wrong']['metrics']['encode'])
        self.assertEqual(rows[report.LOCAL]['datasets']['English']['decode']['rank'], '1/1')
        self.assertNotIn('not-selected', rows)
        local = run['verification'][0]
        next(c for c in local['checks'] if c['dataset'] == 'LeadingBOM')['roundTrip'] = False
        local['passed'] = False
        groups = report.summarize(run, report.validate_timing(run))
        local_row = next(r for r in groups['o200k_base'] if r['id'] == report.LOCAL)
        self.assertTrue(local_row['probe_failures'])
        self.assertEqual(local_row['metrics']['encode']['rank'], '1/1')

    def test_timing_rejects_corruption_including_missing_warmup(self):
        original, _ = fixture()
        mutations = [
            lambda r: r.update(finishedAt=''), lambda r: r.update(errors=['failure']),
            lambda r: r['settings'].update(rounds=4), lambda r: r['settings'].update(minMs=299),
            lambda r: r['settings'].update(warmupMs=99),
            lambda r: r['samples'].pop(),
            lambda r: r['samples'].append(deepcopy(r['samples'][0])),
            lambda r: r['samples'][0].update(round=99),
            lambda r: r['samples'][0].update(id='not-selected'),
            lambda r: r['verification'].pop(),
            lambda r: r['verification'][0]['checks'].pop(),
            lambda r: r['samples'][0]['datasets'].pop('English'),
            lambda r: r['samples'][0]['datasets']['English'].pop('decode'),
            lambda r: r['samples'][0]['datasets']['English']['encode'].pop('warmup'),
            lambda r: r['samples'][0]['datasets']['English']['encode']['warmup'].update(elapsedMs=99),
            lambda r: r['samples'][0]['datasets']['English']['encode']['warmup'].update(calls=4),
            lambda r: r['samples'][0]['datasets']['English']['encode'].update(ms=float('nan')),
            lambda r: r['samples'][0]['datasets']['English']['encode'].update(elapsedMs=300),
            lambda r: r['candidateBuild'].update({'GptEncoding.js': 'wrong'}),
        ]
        for index, mutate in enumerate(mutations):
            with self.subTest(index=index):
                broken = deepcopy(original)
                mutate(broken)
                with self.assertRaises((ValueError, KeyError)):
                    report.validate_timing(broken)

    def test_memory_scope_provenance_checksums_and_delta_corruption(self):
        run, memory = fixture()
        with TemporaryDirectory() as directory:
            path = Path(directory) / 'timing.json'
            path.write_text(json.dumps(run))
            memory['timingSha256'] = report.sha256(path)
            cases = report.validate_timing(run)
            report.validate_memory(memory, run, path, cases)
            mutations = [
                lambda r: r.update(timingSha256='d' * 64),
                lambda r: r['candidateBuild'].update({'GptEncoding.js': 'd' * 64}),
                lambda r: r['environment'].update(engineVersion='26.7.0'),
                lambda r: r.update(timingSourceCommit='different'),
                lambda r: r.update(productionSourceUnchanged=False),
                lambda r: r['packages'][0].update(version='different'),
                lambda r: r['inputs'][0].update(sha256='d' * 64),
                lambda r: r['samples'].pop(),
                lambda r: r['samples'][0].update(id='not-selected'),
                lambda r: r['samples'][0].update(checksum=18),
                lambda r: r['samples'][0]['retained'].update(heapUsed=2),
                lambda r: r['samples'][0]['final'].update(heapUsed=float('inf')),
            ]
            for index, mutate in enumerate(mutations):
                with self.subTest(index=index):
                    broken = deepcopy(memory)
                    mutate(broken)
                    with self.assertRaises(ValueError):
                        report.validate_memory(broken, run, path, cases)

    def test_cli_timing_only_and_settled_output(self):
        run, memory = fixture()
        with TemporaryDirectory() as directory:
            timing, mem, output = [Path(directory) / name for name in ['timing.json', 'memory.json', 'report.md']]
            timing.write_text(json.dumps(run))
            report.main([str(timing), '-', str(output)])
            text = output.read_text()
            self.assertIn('dominated by synthetic', text)
            self.assertIn('No footprint ranks', text)
            self.assertIn('TIMED MISMATCH', text)
            self.assertIn('LeadingBOM', text)
            self.assertNotIn('not-selected/o200k_base', text)
            memory['timingSha256'] = report.sha256(timing)
            mem.write_text(json.dumps(memory))
            report.main([str(timing), str(mem), str(output)])
            text = output.read_text()
            self.assertIn('Settled working memory', text)
            self.assertIn('One-pass peak RSS MiB', text)
            self.assertIn(report.sha256(mem), text)
            with self.assertRaises(ValueError):
                report.main([str(timing), '-', str(timing)])


if __name__ == '__main__':
    unittest.main()
