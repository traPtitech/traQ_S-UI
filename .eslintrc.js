const isStrict =
  process.env.CI === 'true' || process.env.NODE_ENV === 'production'

module.exports = {
  root: true,
  env: {
    node: true
  },
  parserOptions: {
    parser: '@typescript-eslint/parser'
  },
  extends: [
    'plugin:vue/strongly-recommended',
    '@vue/prettier',
    '@vue/typescript'
  ],
  plugins: ['unused-imports'],
  rules: {
    'no-console': isStrict ? 'error' : 'warn',
    'no-debugger': isStrict ? 'error' : 'warn',
    'no-fallthrough': 'error',
    '@typescript-eslint/no-unused-vars': 'off',
    'unused-imports/no-unused-imports-ts': isStrict ? 'error' : 'warn',
    'unused-imports/no-unused-vars-ts': 'off'
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
