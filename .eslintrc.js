module.exports = {
  root: true,
  env: {
    node: true
  },
  parserOptions: {
    parser: '@typescript-eslint/parser'
  },
  extends: [
    'plugin:vue/vue3-recommended',
    '@vue/typescript/recommended',
    '@vue/prettier',
    '@vue/prettier/@typescript-eslint'
  ],
  plugins: ['unused-imports'],
  rules: {
    'no-console': 'warn',
    'no-debugger': 'warn',
    'no-empty': ['error', { allowEmptyCatch: true }],
    eqeqeq: 'error',
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
    'vue/custom-event-name-casing': ['error', 'camelCase'],
    'vue/no-v-html': 'off',
    'vue/block-lang': [
      'error',
      {
        script: { lang: 'ts' },
        style: { lang: 'scss' }
      }
    ],
    'vue/require-emit-validator': 'error'
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
  ]
}
