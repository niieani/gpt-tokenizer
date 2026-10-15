import { defineConfig } from 'vite-plus'

export default defineConfig({
  fmt: {
    semi: false,
    singleQuote: true,
    trailingComma: 'all',
    printWidth: 80,
    ignorePatterns: [
      'fixtures/',
      'node_modules/',
      'dist/',
      'results/',
      'RESULTS.md',
      'OPTIMIZED-RESULTS.md',
      'experiments/*-RESULTS.md',
      'experiments/OVERVIEW.md',
      'experiments/snapshots/',
      'experiments/snapshot-sources/',
      'experiments/rejected/',
      'experiments/diagnostics/',
    ],
  },
})
