import json
from pathlib import Path
import tiktoken
strings=set()
white=[' ', '\t', '\n', '\r', '\r\n', '\x85', '\xa0', '\u1680', '\u2000', '\u200a', '\u2028', '\u2029', '\u202f', '\u205f', '\u3000', '\ufeff', '\x1c', '\x1d', '\x1e', '\x1f', '\v', '\f', '\u200b', '\u180e']
for prefix in ['', 'a', '1', '!', "a'"]:
 for first in white:
  for second in white:
   strings.add(prefix+first+second+'word')
   strings.add(prefix+first+second)
for punctuation in ['!', '?', '=', '\\', '/', '_', '.', '--', '://', '😀', '\u0301']:
 for newline in ['\n', '\r', '\r\n', '\u2028', '\u2029']:
  for suffix in ['\\a', '\\n', '\\t', '\\alpha', '/a', '/n', '\\\\x', "\\'s", "/'s", '\\/foo', '/\\foo']:
   strings.add(punctuation+newline+suffix)
letters=['a', 'A', 'á', 'ǅ', 'ʰ', '中', '\u0301', '\u0345', '\u02bc', 'Ⅰ', 'ⅰ', '²', '१', '😀', '\x85', '\ufeff']
for first in letters:
 for second in letters:
  for ending in ['a', 'A', '1', '\n', "'s", "'S", "'ſ", "'LL", "'lL", "'ve", "'Ve"]:
   strings.add(first+second+ending)
for suffix in ['ſ', 'K', 'İ', 'ı', 'ß', 'ẞ', '\u0345', 'S', 's', 't', 'M', 'LL', 'Ll', 'lL', 'lK', 'vE', 'rE']:
 for prefix in ["'", "a'", "A'", "hello'", "HELLO'"]:
  for ending in ['', 'a', 'A', '1', ' ', '\n']:
   strings.add(prefix+suffix+ending)
for unit in ['\ud800', '\udc00', '\ud800a', 'a\udc00', '\ud800\udc00']:
 for prefix in ['', 'a', '!', '\n', ' ']:
  for suffix in ['', 'A', '1', '\n', "'ſ"]:
   strings.add(prefix+unit+suffix)
strings=sorted(strings)
encodings={name:tiktoken.get_encoding(name)for name in ['cl100k_base','o200k_base']}
out={'officialVersion':tiktoken.__version__,'inputs':strings,'patterns':{name:enc._pat_str for name,enc in encodings.items()},'expected':{name:[enc.encode_ordinary(text)for text in strings]for name,enc in encodings.items()}}
Path('/tmp/gpt-regex-semantic-oracle.json').write_text(json.dumps(out,ensure_ascii=True))
print('Official finite semantic oracle:',len(strings),'structured strings,',list(encodings))
