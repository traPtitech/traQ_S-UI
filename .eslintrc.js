module.exports = {
  root: true,
  env: {
    node: true
  },
  parserOptions: {
    parser: '@typescript-eslint/parser'
  },
  extends: [
    // FIXME: .vueで無効されるべきルールが無効化されない
    // https://github.com/typescript-eslint/typescript-eslint/blob/9aea46abcf867f3512ccb0c182fa3ff8284b3c40/packages/eslint-plugin/src/configs/eslint-recommended.ts#L9
    // 'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:vue/vue3-recommended',
    'plugin:prettier/recommended'
  ],
  plugins: ['unused-imports'],
  rules: {
    'no-console': 'warn',
    'no-debugger': 'warn',
    'no-empty': ['error', { allowEmptyCatch: true }],
    eqeqeq: 'error',
    'vue/eqeqeq': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/member-delimiter-style': [
      'error',
      {
        multiline: {
          delimiter: 'none'
        },
        singleline: {
          delimiter: 'semi'
        }
      }
    ],
    '@typescript-eslint/no-unused-vars': 'off',
    'unused-imports/no-unused-imports': 'warn',
    'unused-imports/no-unused-vars': 'off',
    'vue/no-v-html': 'off',
    'vue/block-lang': [
      'error',
      {
        script: { lang: 'ts' },
        style: { lang: 'scss' }
      }
    ],
    'vue/component-api-style': ['error', ['composition']],
    'vue/component-name-in-template-casing': ['error', 'kebab-case'],
    'vue/custom-event-name-casing': ['error', 'camelCase'],
    'vue/v-on-event-hyphenation': ['error', 'always', { autofix: true }],
    'vue/match-component-file-name': ['error', { extensions: ['vue'] }],
    'vue/v-on-function-call': 'error',
    'vue/require-emit-validator': 'error',
    'vue/no-template-target-blank': 'error',
    'vue/valid-next-tick': 'error'
  },
  overrides: [
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)',
        '**/tests/unit/**/*.spec.{j,t}s?(x)'
      ],
      env: {
        jest: true
      }
    }
  ],
  reportUnusedDisableDirectives: true
}
