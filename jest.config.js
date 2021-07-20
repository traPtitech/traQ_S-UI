//@ts-check

/**
 * @type {import('./src/types/config').Config}
 */
const traQConfig = {
  firebase: {
    apiKey: '',
    appId: '',
    projectId: '',
    messagingSenderId: ''
  },
  isRootChannelSelectableAsParentChannel: false
}

module.exports = {
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'ts', 'json', 'vue'],
  moduleNameMapper: {
    '^@/(.+)': '<rootDir>/src/$1'
  },
  transform: {
    '^.+\\.vue$': 'vue3-jest',
    '^.+\\.ts$': '<rootDir>/tests/unit/envReplaceAndTranspileTransformer',
    '^.+\\.json$': '<rootDir>/tests/unit/jsonTransformer'
  },
  globals: {
    'vue-jest': {
      transform: {
        ts: '<rootDir>/tests/unit/envReplaceAndTranspileTransformer'
      }
    },
    __VERSION__: JSON.stringify('test'),
    __DEV_SERVER__: JSON.stringify('https://example.com'),
    traQConfig
  },
  coverageDirectory: './coverage/',
  collectCoverage: true,
  setupFiles: ['fake-indexeddb/auto']
}
