module.exports = {
  root: true,
  parserOptions: {
    parser: '@typescript-eslint/parser'
  },
  extends: [
    'eslint:recommended',
    './eslint-vue-ts-recommended.js',
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
    'vue/require-default-prop': 'off',
    'vue/no-v-html': 'off',
    'vue/block-lang': [
      'error',
      {
        script: { lang: 'ts' },
        style: { lang: 'scss' }
      }
    ],
    'vue/component-api-style': ['error', ['script-setup']],
    'vue/component-name-in-template-casing': ['error', 'kebab-case'],
    'vue/custom-event-name-casing': ['error', 'camelCase'],
    'vue/v-on-event-hyphenation': ['error', 'always', { autofix: true }],
    'vue/match-component-file-name': ['error', { extensions: ['vue'] }],
    'vue/v-on-function-call': 'error',
    'vue/require-emit-validator': 'error',
    'vue/no-template-target-blank': 'error',
    'vue/prefer-true-attribute-shorthand': 'error',
    'vue/prefer-import-from-vue': 'error'
  },
  overrides: [
    {
      // 直下のファイル
      files: ['*.{js,mjs}'],
      excludedFiles: ['*/**/*.{js,mjs}'],
      env: {
        node: true
      },
      rules: {
        '@typescript-eslint/no-var-requires': 'off'
      }
    },
    {
      files: ['**/tests/e2e/**/*.{js,mjs,jsx,ts,tsx}'],
      extends: ['plugin:cypress/recommended'],
      env: {
        node: true
      }
    }
  ],
  reportUnusedDisableDirectives: true
}
