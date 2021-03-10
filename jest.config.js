module.exports = {
  preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
  globals: {
    __VERSION__: JSON.stringify('test'),
    __DEV_SERVER__: JSON.stringify('https://example.com')
  },
  coverageDirectory: './coverage/',
  collectCoverage: true,
  setupFiles: ['fake-indexeddb/auto']
}
