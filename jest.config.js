module.exports = {
  preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!lodash-es/.*)'],
  globals: {
    // https://github.com/vuejs/vue-cli/blob/dcfb0bdbc948d73371f70d650f0f808f81c51cc1/packages/%40vue/cli-plugin-unit-jest/presets/typescript-and-babel/jest-preset.js#L8-L9
    'ts-jest': {
      babelConfig: true
    },
    __VERSION__: JSON.stringify('test'),
    __DEV_SERVER__: JSON.stringify('https://example.com')
  }
}
