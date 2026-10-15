#!/usr/bin/env python3
"""Generate Unicode-version boundary vectors using official Python tiktoken.

Run with tiktoken==0.14.0, --unicode16 and --unicode17 pointing to the
corresponding UnicodeData.txt downloads. No third-party oracle is used at test
runtime; generated token IDs are checked in for reproducible offline tests.
"""
import argparse
from bisect import bisect_right
import hashlib
import json
from itertools import product
from pathlib import Path
import tiktoken
from generateUnicodeProperties import category_ranges, EXPECTED_SHA256


def signature(category):
    return (category.startswith('L'), category.startswith('N'), category in ['Lu', 'Lt', 'Lm', 'Lo', 'Mn', 'Mc', 'Me'], category in ['Ll', 'Lm', 'Lo', 'Mn', 'Mc', 'Me'])


def contraction_inventory(unicode_data):
    # Simple upper/lower/title mappings form the relevant ASCII casefold
    # equivalence classes. For these eight letters the only non-ASCII member
    # is long-s, derived from UCD data rather than a hand-maintained exception.
    graph = {}
    for row in unicode_data.splitlines():
        fields = row.split(';')
        point = int(fields[0], 16)
        for mapping in fields[12:15]:
            if mapping:
                other = int(mapping, 16)
                graph.setdefault(point, set()).add(other)
                graph.setdefault(other, set()).add(point)
    inventory = {}
    for letter in 'sdtmlver':
        seen, pending = set(), [ord(letter)]
        while pending:
            point = pending.pop()
            if point not in seen:
                seen.add(point)
                pending.extend(graph.get(point, ()))
        inventory[letter] = [chr(point) for point in sorted(seen)]
    return inventory


def counterexample():
    state = 0x519be07
    def random():
        nonlocal state
        state ^= (state << 13) & 0xffffffff
        state ^= state >> 17
        state ^= (state << 5) & 0xffffffff
        state &= 0xffffffff
        return state
    result = ''
    for _ in range(209):
        chars = []
        for _ in range(random() % 160):
            choice, value = random() % 5, random()
            point = 32 + value % 95 if choice == 0 else 0x300 + value % 112 if choice == 1 else 0x4e00 + value % 20902 if choice == 2 else 0x1f300 + value % 768 if choice == 3 else value % 0x110000
            chars.append(chr(point))
        result = ''.join(chars)
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--unicode16', type=Path, required=True)
    parser.add_argument('--unicode17', type=Path, required=True)
    args = parser.parse_args()
    assert tiktoken.__version__ == '0.14.0'
    source16, source17 = args.unicode16.read_bytes(), args.unicode17.read_bytes()
    assert hashlib.sha256(source16).hexdigest() == EXPECTED_SHA256
    ranges16 = category_ranges(source16.decode())
    ranges17 = category_ranges(source17.decode())
    starts = [start for start, _, _ in ranges16]
    def old_category(point):
        index = bisect_right(starts, point) - 1
        return ranges16[index][2] if index >= 0 and ranges16[index][1] >= point else 'Cn'
    points = set()
    for start, end, category in ranges17:
        for point in {start, end}:
            if signature(category) != signature(old_category(point)):
                points.update(value for value in [point - 1, point, point + 1] if 0 <= value <= 0x10ffff)
    # Unicode16-only assignments also guard older-JS-engine behavior. Todhri,
    # Tulu-Tigalari, Gurung Khema and outlined decimal digits cover L/M/N.
    points.update([0x105bf, 0x105c0, 0x105f3, 0x105f4, 0x11380, 0x113b8, 0x16100, 0x1611e, 0x1ccf0, 0x1ccf9, 0x1ccfa])
    texts = ['\U00032a13?t', counterexample()]
    for point in sorted(points):
        character = chr(point)
        texts.extend([f'{character}?t', f'A{character}a1{character}2'])
    inventory = contraction_inventory(source16.decode())
    for suffix in ['s', 'd', 'm', 't', 'll', 've', 're']:
        for folded in product(*(inventory[letter] for letter in suffix)):
            for prefix in ['', 'I', ' I', 'we', 'foo']:
                for following in ['', 'a', 'test']:
                    texts.append(f"{prefix}'{''.join(folded)}{following}")
    texts = list(dict.fromkeys(texts))
    result = {
        'generatedBy': 'src/codegen/generateUnicodeTokenFixtures.py',
        'oracle': 'OpenAI tiktoken 0.14.0',
        'unicodeCategoryVersion': '16.0.0',
        'sources': {version: {'url': f'https://www.unicode.org/Public/{version}.0.0/ucd/UnicodeData.txt', 'sha256': hashlib.sha256(data).hexdigest()} for version, data in [('16', source16), ('17', source17)]},
        'contractionCasefoldInventory': inventory,
        'counterexample': {'seed': '0x519be07', 'randomCase': 208},
        'cases': [{ 'text': text, 'tokens': {name: tiktoken.get_encoding(name).encode(text) for name in ['cl100k_base', 'o200k_base']}} for text in texts],
    }
    destination = Path(__file__).resolve().parents[1] / '__fixtures__' / 'unicode16Tokens.json'
    destination.parent.mkdir(exist_ok=True)
    destination.write_text(json.dumps(result, ensure_ascii=True, indent=2) + '\n')
    print(f'Wrote {destination}: {len(texts)} vectors per encoding')


if __name__ == '__main__':
    main()
