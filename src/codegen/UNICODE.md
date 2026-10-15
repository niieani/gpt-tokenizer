# Unicode category data

OpenAI tiktoken 0.14.0 uses Unicode 16 general categories. JavaScript engines can
use a different Unicode version: Node 26/Bun 1.4 report Unicode 17, where new CJK
letters change pre-token boundaries. For example, U+32A13 followed by `?t`
previously merged the final two characters; the canonical encodings separate
those tokens. Input characters are preserved verbatim.

`generateUnicodeProperties.py` owns `src/encodingParams/unicode16Data.ts`. It
requires the exact Unicode 16 and17 `UnicodeData.txt` files from unicode.org,
validates their SHA-256 hashes, and emits four range unions plus exact 17-to-16
set corrections. Unicode License V3 is included at `data/Unicode-LICENSE.txt`.
Run under the repository's performance queue:

```sh
python3 src/codegen/generateUnicodeProperties.py \
  --unicode-data /path/UnicodeData-16.txt \
  --unicode17-data /path/UnicodeData-17.txt
```

Known Unicode 17 engines scan for characters whose category membership differs.
Unchanged input uses the original native `u` pattern; affected input uses compact
native property sets with generated subtractions/additions, guarded by `RegExp`'s
`v` support. Both `match` and `matchAll` dispatch once per input; iterators keep
independent state and no input strings are retained. Known Unicode 16
engines use native categories with `u`. Unknown/older engines use explicit Unicode 16
ranges with `u`, so correctness does not depend on detecting their Unicode
version and `v` syntax is never required at parse time. The explicit fallback
can be slower on V8: very long regular-expression sources miss its optimized
execution path. Browsers that do not report a Unicode version use native patterns for ASCII
and the conservative fallback for non-ASCII. Changes to this selection must preserve the pinned
category semantics, including complement classes and category reassignments.

`generateUnicodeTokenFixtures.py` owns
`src/__fixtures__/unicode16Tokens.json`. Run with official Python
`tiktoken==0.14.0`, the same UnicodeData files, and cached encoding downloads:

```sh
python src/codegen/generateUnicodeTokenFixtures.py \
  --unicode16 /path/UnicodeData-16.txt \
  --unicode17 /path/UnicodeData-17.txt
```

The fixture covers 16/17 category boundaries, 16-only assignments for older
engines, and the minimal/full seeded counterexample. It also derives the simple
casefold inventories of all contraction letters from Unicode 16 mappings and
tests each suffix variant with leading-space/word prefixes and following letters.
Long-s (U+017F) belongs to the S/s class, including in the shared CL/o200k
contraction expression; the case-sensitive R50 pattern is unchanged. Tests check encode,
count, encode-generator, and decode against the checked-in official token IDs.
