module.exports = {
  preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
  // 下の文とts-jestのdependencyはts-jestのバージョンがあがれば取り除ける
  transform: {
    '^.+\\.tsx?$': require.resolve('ts-jest')
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!lodash-es/.*)']
}
