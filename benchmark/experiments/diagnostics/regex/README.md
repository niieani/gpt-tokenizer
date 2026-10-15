# Finite official regex-semantics audit

A separate agent compared 9,809 structured strings, both OpenAI encodings and
both engines, against official Python `tiktoken==0.14.0`: zero token-ID/count
mismatches in the corrected build. This covers whitespace/control boundaries,
newlines/end handling, slash/backslash punctuation, Unicode category transitions,
contractions and surrogates. The explicit long-s counterexample is additionally
covered by the production fixture generator and expanded benchmark gate; this
finite audit is not an exhaustive proof.

The files preserve the historical generator, runner, complete expected corpus,
and engine summaries. They retain the original absolute worktree/output paths;
adapt those paths and use the pinned Python dependency/cache when replaying.
Run through the machine queue. These are correctness diagnostics, not timings or
ranking evidence. Pattern-module hashes are recorded in each engine summary.

- Complete oracle/corpus SHA-256: `91e9c1033a7f5b21241a5c9ba70273cf4654eaad9ac22c54e96fad4b1712c617`
- Generator SHA-256: `a8a750f6cc6ed066114de179aef323b06c712724b2d085ad82c54ea6b174a9ca`
- Runner SHA-256: `16a83b8d1d39c42a22c95bd70ff3ca0013cd9f6f3eb60d0865f1d881c71d61ca`
