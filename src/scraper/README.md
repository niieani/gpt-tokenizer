# OpenAI model data scraper

OpenAI's model catalog is rendered from data embedded in a hashed Astro
JavaScript module. The documentation currently exposes neither the underlying
YAML files nor a stable structured-data endpoint. The module filename and its
minified identifiers change when the documentation site is deployed.

This directory provides two ways to extract that data:

- `modelScrape.node.ts`: preferred, automated Node scraper.
- `modelScrape.browser.js`: manual DevTools fallback and shared code generator.

## Updating `src/models.gen.ts`

Run the automated scraper:

```sh
yarn scrape:models
```

It starts at the
[OpenAI model catalog](https://developers.openai.com/api/docs/models), discovers
the current `models-page-data` module through the page's Astro module graph, and
updates `src/models.gen.ts`.

The `models-page-data` name is an intentional hard contract. If OpenAI renames
that module, the scraper stops with an error because its internal data shape is
also likely to have changed.

### Using a downloaded bundle

For offline or reproducible operation, pass a previously downloaded module:

```sh
yarn scrape:models "temp.local/$(date +%F)/models-page-data.js"
```

The filename observed on August 15, 2026 was:

```text
https://developers.openai.com/_astro/models-page-data.react.DettWjxs.js
```

A convenient local staging location is the repository's ignored `temp.local`
directory:

```sh
mkdir -p "temp.local/$(date +%F)"
curl -fL \
  https://developers.openai.com/_astro/models-page-data.react.DettWjxs.js \
  -o "temp.local/$(date +%F)/models-page-data.js"
```

The command atomically replaces `src/models.gen.ts`. The generated file always
starts with:

```text
import type { ModelConfig, ModelSpec } from "./modelTypes.js"
```

Review the diff, update `src/modelTypes.ts` if OpenAI expanded the schema, then
run the repository's normal build and test commands.

## Node pipeline

The Node scraper uses two stages:

1. It fetches the model catalog and extracts `component-url` values from its
   Astro islands.
2. It first crawls modules named `ModelOverview.react.*`, prioritizing
   `ModelArt.react.*` and `ModelItem.react.*` imports. These names are hints,
   not correctness requirements.
3. If prioritized modules are absent or do not lead to the data, it warns and
   crawls the remaining same-origin Astro island graphs.
4. The crawl is bounded to five levels, 50 modules, and 5 MiB of JavaScript.
5. It accepts only a module whose filename begins with `models-page-data` and
   whose source contains the expected data anchors. Not finding one is an
   explicit signal to reassess the upstream implementation.
6. Inside that module, it locates the model, snapshot, and pricing identifiers
   through stable semantic anchors:

   - `./models-data/`
   - `./snapshots-data/`
   - `name: "Other models"`

7. It requires exactly one match for each anchor. A changed or ambiguous bundle
   fails instead of guessing.
8. It discovers local names from the module's named imports.
9. It removes those import declarations and the final export declaration.
10. It binds each imported name to a recursive callable proxy. React and UI
    dependencies can therefore complete their top-level initialization without
    downloading the bundle's other modules.
11. It evaluates the transformed, trusted bundle in a fresh Node `vm` context
    with a five-second timeout.
12. It evaluates `modelScrape.browser.js` in the same context and calls its
    `codegen(models, snapshots, pricing)` function using the discovered
    identifiers.
13. It prepends the `ModelConfig`/`ModelSpec` type import and atomically writes
    `src/models.gen.ts`.

Node's `vm` isolates names and limits execution time, but it is not a security
boundary. Only run this against a bundle downloaded from the official OpenAI
documentation site.

## Manual browser fallback

If the Node transformation stops matching a future bundle:

1. Set a DevTools breakpoint after the model data has initialized.
2. Find the current identifiers by searching the module for the same three
   semantic anchors listed above.
3. Paste all of `modelScrape.browser.js` into the paused console.
4. Run:

   ```js
   copy(codegen(<models>, <snapshots>, <other pricing>))
   ```

For the August 15, 2026 bundle, the invocation was:

```js
copy(codegen(PU, TU, aB))
```
