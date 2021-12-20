//@ts-check

/**
 * @type {import('./src/types/config').Config}
 */
const traQConfig = {
  firebase: {
    apiKey: '',
    appId: '',
    projectId: '',
    messagingSenderId: '',
    vapidKey: ''
  },
  isRootChannelSelectableAsParentChannel: false
}

module.exports = {
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'ts', 'json', 'vue'],
  moduleNameMapper: {
    '\\.mp3': 'identity-obj-proxy',
    '^/@/(.+)': '<rootDir>/src/$1'
  },
  transform: {
    '^.+\\.vue$': '@vue/vue3-jest',
    '^.+\\.ts$': '<rootDir>/tests/unit/envReplaceAndTranspileTransformer'
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
  collectCoverage: true,
  coverageDirectory: './coverage/',
  coveragePathIgnorePatterns: ['.mock.ts']
}
