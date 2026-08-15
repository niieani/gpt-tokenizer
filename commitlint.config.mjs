export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'body-case': [0],
    'header-case': [0],
    'header-max-length': [0],
    'scope-case': [0],
    'subject-case': [0],
    'type-case': [0],
    'type-enum': [
      2,
      'always',
      [
        'build',
        'chore',
        'ci',
        'docs',
        'feat',
        'fix',
        'perf',
        'refactor',
        'revert',
        'style',
        'test',
        'wip',
      ],
    ],
  },
}
