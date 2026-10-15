#!/usr/bin/env python3
"""Generate corpus-v3 snapshots from self-contained, sanitized source extracts.

Historical v2 measurements retain their original input hashes. Their private
README bytes are deliberately unavailable; generating v3 never rewrites them.
"""
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
SOURCE = HERE / 'snapshot-sources'
OUTPUT = HERE / 'snapshots'
provenance = json.loads((SOURCE / 'provenance.json').read_text())
files = {
    'readme.md': ('long-prose', ['README.md']),
    'encoding.ts': ('long-code', ['src/GptEncoding.ts']),
    'packages.json': ('long-structured', ['package.json', 'benchmark/package.json', 'demo/package.json']),
}
manifest = {
    'version': 3,
    'commit': provenance['originalPrepublicationCommit'],
    'provenance': 'Self-contained sanitized pre-optimization repository extracts from snapshot-sources/. The commit is an original local pre-publication identifier, not a required Git object. Historical v2 input hashes remain recorded separately.',
    'privacyTransformation': provenance,
    'files': {},
}
OUTPUT.mkdir(exist_ok=True)
for name, (category, sources) in files.items():
    data = (SOURCE / name).read_bytes()
    (OUTPUT / name).write_bytes(data)
    manifest['files'][name] = {'category': category, 'sources': sources, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()}
(OUTPUT / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
