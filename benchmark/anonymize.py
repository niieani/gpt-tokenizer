#!/usr/bin/env python3
"""Anonymize publication metadata, preserving measured inputs/builds/harnesses.

Run on new raw files before publishing: python3 anonymize.py results/PREFIX-*.json
This never changes workload text or measurements. File-level digests change;
linked memory records are refreshed to reference the anonymized timing files.
"""
import argparse
import hashlib
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parent


def anonymize(paths):
    loaded = {path: (path.read_bytes(), json.loads(path.read_text())) for path in paths}
    hosts = {}
    def find_hosts(value):
        if isinstance(value, dict):
            for key, item in value.items():
                if key == 'hostname' and isinstance(item, str):
                    hosts[item] = item if item == 'benchmark-vm' or re.fullmatch(r'host-[0-9a-f]{16}', item) else 'host-' + hashlib.sha256(item.encode()).hexdigest()[:16]
                find_hosts(item)
        elif isinstance(value, list):
            for item in value:
                find_hosts(item)
    for _, value in loaded.values():
        find_hosts(value)
    def clean(value, key=''):
        if isinstance(value, dict):
            return {k: clean(v, k) for k, v in value.items()}
        if isinstance(value, list):
            return [clean(v, key) for v in value]
        if isinstance(value, str) and key not in {'text', 'inputText'}:
            if key == 'hostname':
                return hosts[value]
            # Even a hexadecimal hostname must never alter a recorded digest.
            if re.fullmatch(r'(?:[0-9a-f]{40}|[0-9a-f]{64})', value):
                return value
            value = value.replace(str(REPO), '/checkout')
            value = re.sub(r'/(?:Users|home)/[^/\s"\'`]+', '/user', value)
            for hostname, identifier in hosts.items():
                value = value.replace(hostname, identifier)
        return value
    for path, (original, value) in loaded.items():
        redacted = clean(value)
        if redacted != value:
            redacted.setdefault('publicationPrivacy', {
                'schema': 1,
                'originalRawSha256': hashlib.sha256(original).hexdigest(),
                'note': 'Local paths and machine labels anonymized. Measurements and original input/build/harness digests are unchanged.',
            })
            path.write_text(json.dumps(redacted, indent=2) + '\n')
    for path in paths:
        value = json.loads(path.read_text())
        if 'timingSha256' not in value:
            continue
        source = ROOT / value['timingFile']
        if not source.exists():
            source = next((p for p in paths if p.name == Path(value['timingFile']).name), source)
        digest = hashlib.sha256(source.read_bytes()).hexdigest()
        if digest != value['timingSha256']:
            value['timingSha256'] = digest
            path.write_text(json.dumps(value, indent=2) + '\n')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('files', nargs='+', type=Path)
    anonymize(parser.parse_args().files)
