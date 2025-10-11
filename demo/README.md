# GPT Tokenizer Demo

A showcase playground for the [`gpt-tokenizer`](https://github.com/niieani/gpt-tokenizer) package. The demo is designed for gpt-tokenizer.dev and highlights model switching, inline token visualisation, pricing insights, and chat prompt experimentation.

## Features

- 🔄 Lazy-loaded tokenizers for every chat-enabled OpenAI model, defaulting to **gpt-5**.
- ✨ A single token-aware editor that highlights each token as you type with hover previews and a global "show token IDs" toggle.
- 💬 Chat and prompt workflows share the same interface via responsive tabs, with per-message token counts and a conversation preview.
- 💰 Live cost estimation with per-channel breakdowns for text and chat prompts.
- 🧠 Model insight cards sourced directly from the `gpt-tokenizer` metadata, including modalities, pricing, and capabilities.
- 🌓 Built-in light/dark mode toggle, plus quick links to sponsor @niieani, star the repository, and explore the npm package.

## Getting started

```bash
cd demo
npm install
npm run dev
```

The dev server runs on [http://localhost:5173](http://localhost:5173). The build output is generated with `npm run build`.

## Scripts

| Command        | Description                                      |
| -------------- | ------------------------------------------------ |
| `npm run dev`  | Start the Vite development server.               |
| `npm run build`| Type-check the project and create a production build. |
| `npm run preview` | Preview the built app locally.                |

## Tech stack

- React 19
- Vite 7
- Tailwind CSS 4 with the official Vite plugin
- TypeScript + Vite code-splitting via `import.meta.glob` for lazy tokenizer bundles

## Deployment notes

The demo expects the `gpt-tokenizer` package to be available at the repository root (`"gpt-tokenizer": "file:.."`). Deployments should install the root package first or replace the file dependency with a published version.
