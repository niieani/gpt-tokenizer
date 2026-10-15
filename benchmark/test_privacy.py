"""Metadata redaction must never relabel measured workload bytes."""
import hashlib
import json
from pathlib import Path
import tempfile
import unittest

from anonymize import anonymize


class PrivacyTests(unittest.TestCase):
    def test_redaction_preserves_measurements_and_refreshes_linked_digest(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            timing = root / 'timing.json'
            memory = root / 'memory.json'
            private = '/' + 'home/private-test/bin/node'
            original = {'environment': {'hostname': 'private-test-machine', 'executable': private},
                        'inputs': [{'sha256': 'a' * 64}], 'candidateBuild': {'core.js': 'b' * 64},
                        'harnessSha256': 'c' * 64, 'samples': [{'ms': 1.25}], 'text': private}
            timing.write_text(json.dumps(original))
            original_digest = hashlib.sha256(timing.read_bytes()).hexdigest()
            memory.write_text(json.dumps({'timingFile': str(timing), 'timingSha256': original_digest,
                                          'samples': [{'rss': 42}]}))
            anonymize([timing, memory])
            actual = json.loads(timing.read_text())
            self.assertTrue(actual['environment']['hostname'].startswith('host-'))
            self.assertEqual(actual['environment']['executable'], '/user/bin/node')
            for field in ['inputs', 'candidateBuild', 'harnessSha256', 'samples', 'text']:
                self.assertEqual(actual[field], original[field])
            self.assertEqual(actual['publicationPrivacy']['originalRawSha256'], original_digest)
            linked = json.loads(memory.read_text())
            self.assertEqual(linked['timingSha256'], hashlib.sha256(timing.read_bytes()).hexdigest())
            self.assertEqual(linked['samples'], [{'rss': 42}])
            first = [p.read_bytes() for p in [timing, memory]]
            anonymize([timing, memory])
            self.assertEqual(first, [p.read_bytes() for p in [timing, memory]])

    def test_snapshot_manifest_distinguishes_archived_input(self):
        root = Path(__file__).parent / 'experiments'
        manifest = json.loads((root / 'snapshots/manifest.json').read_text())
        self.assertEqual(manifest['version'], 3)
        actual = (root / 'snapshots/readme.md').read_bytes()
        self.assertEqual(manifest['files']['readme.md']['sha256'], hashlib.sha256(actual).hexdigest())
        self.assertNotEqual(manifest['privacyTransformation']['measuredV2']['readme.md']['sha256'], hashlib.sha256(actual).hexdigest())

    def test_hostname_substring_cannot_modify_hashes(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'raw.json'
            path.write_text(json.dumps({'hostname': 'a' * 40, 'candidateBuild': {'core.js': 'a' * 64}}))
            anonymize([path])
            actual = json.loads(path.read_text())
            self.assertEqual(actual['candidateBuild']['core.js'], 'a' * 64)
            self.assertTrue(actual['hostname'].startswith('host-'))


if __name__ == '__main__':
    unittest.main()
