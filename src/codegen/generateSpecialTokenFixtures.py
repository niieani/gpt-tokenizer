#!/usr/bin/env python3
"""Generate all built-in special-token vectors with official tiktoken 0.14.0.

Run with Python tiktoken==0.14.0 installed and cached encoding downloads:
  python src/codegen/generateSpecialTokenFixtures.py
The checked-in fixtures keep tests offline. Uses the repository's Vite+ formatter.
"""
import hashlib
import inspect
import json
from pathlib import Path
import subprocess
import tiktoken
import tiktoken.core
import tiktoken_ext.openai_public

ROOT = Path(__file__).resolve().parents[2]
SOURCES = {
    'tiktoken_ext/openai_public.py': (tiktoken_ext.openai_public, '954392738e60d0fb6dca1dad80872efc47c8e2733babecbbf0a23970ed66c2cb'),
    'tiktoken/core.py': (tiktoken.core, '3c136f06b05992855dc329216dfa1fa5b6718cccd3d79f658262de8f871f45f0'),
}
ENCODINGS = ['gpt2', 'r50k_base', 'p50k_base', 'p50k_edit', 'cl100k_base', 'o200k_base', 'o200k_harmony']
EOT = '<|endoftext|>'
EOP = '<|endofprompt|>'
EXTRA_LITERALS = ['<|fim_prefix|>', '<|fim_middle|>', '<|fim_suffix|>', '<|im_start|>', '<|im_end|>', '<|im_sep|>', '<|reserved_200012|>', '<|reserved_201088|>', '<|unknown|>']
POLICIES = [
    {},
    {'allowedSpecial': 'all'},
    {'allowedSpecial': 'all', 'disallowedSpecial': 'all'},
    {'allowedSpecial': [EOT]},
    {'allowedSpecial': [EOP]},
    {'allowedSpecial': [], 'disallowedSpecial': []},
    {'allowedSpecial': [EOT], 'disallowedSpecial': []},
    {'allowedSpecial': 'all', 'disallowedSpecial': [EOT]},
    {'allowedSpecial': [EOT], 'disallowedSpecial': [EOT]},
    {'allowedSpecial': ['all']},
    {'allowedSpecial': ['all', EOT]},
    {'disallowedSpecial': ['all']},
    {'allowedSpecial': 'all', 'disallowedSpecial': ['all']},
    {'disallowedSpecial': ['all', 'unknown exclusion']},
    {'allowedSpecial': ['not registered'], 'disallowedSpecial': []},
    {'allowedSpecial': 'all', 'disallowedSpecial': ['']},
    {'allowedSpecial': ['<|reserved_200018|>'], 'disallowedSpecial': [EOP]},
    {'allowedSpecial': [EOP], 'disallowedSpecial': ['<|reserved_200018|>']},
]
TEXTS = ['', EOT, EOP, EOT + EOP, 'a' + EOT + 'b', 'small', 'unknown exclusion', 'not registered', '<|im_start|>', '<|fim_prefix|>', '<|reserved_200018|>']


def kwargs(policy):
    return {
        {'allowedSpecial': 'allowed_special', 'disallowedSpecial': 'disallowed_special'}[key]: value if value == 'all' else set(value)
        for key, value in policy.items()
    }


def main():
    assert tiktoken.__version__ == '0.14.0'
    for path, (module, expected_hash) in SOURCES.items():
        actual_hash = hashlib.sha256(Path(inspect.getfile(module)).read_bytes()).hexdigest()
        assert actual_hash == expected_hash, (path, actual_hash)
    result = {
        'generatedBy': 'src/codegen/generateSpecialTokenFixtures.py',
        'oracle': 'OpenAI tiktoken 0.14.0',
        'sources': {path: {'url': f'https://github.com/openai/tiktoken/blob/0.14.0/{path}', 'sha256': digest} for path, (_, digest) in SOURCES.items()},
        'policies': POLICIES,
        'encodings': {},
    }
    for name in ENCODINGS:
        encoding = tiktoken.get_encoding(name)
        special_tokens = encoding._special_tokens
        cases = []
        for policy_index, policy in enumerate(POLICIES):
            for text in TEXTS:
                case = {'policy': policy_index, 'text': text}
                try:
                    case['tokens'] = encoding.encode(text, **kwargs(policy))
                except ValueError:
                    case['error'] = True
                cases.append(case)
        invalid_tokens = []
        for token in [50_256, 50_281, 50_282, 50_283, 100_256, *range(100_257, 100_277), 199_998, 199_999, *range(200_000, 200_019), 201_087, 201_088]:
            try:
                encoding.decode_single_token_bytes(token)
            except KeyError:
                invalid_tokens.append(token)
        result['encodings'][name] = {
            'specialTokens': special_tokens,
            'invalidTokenIds': invalid_tokens,
            'ordinaryTokens': {text: encoding.encode(text, disallowed_special=()) for text in special_tokens},
            # Alias decoding is the observed pinned oracle result. For Harmony,
            # both EndOfPrompt and reserved_200018 encode to this same ID.
            'decodedTokens': {str(token): encoding.decode([token]) for token in sorted(set(special_tokens.values()))},
            'unregisteredTokens': {text: encoding.encode(text, allowed_special='all') for text in EXTRA_LITERALS if text not in special_tokens},
            'policies': cases,
        }
    destination = ROOT / 'src/__fixtures__/specialTokens.json'
    destination.write_text(json.dumps(result, ensure_ascii=True, indent=2) + '\n')
    subprocess.run([str(ROOT / 'node_modules/.bin/vp'), 'fmt', str(destination)], check=True, cwd=ROOT)
    print(f'Wrote {destination}: {sum(len(e["specialTokens"]) for e in result["encodings"].values())} special tokens across {len(ENCODINGS)} encodings')


if __name__ == '__main__':
    main()
