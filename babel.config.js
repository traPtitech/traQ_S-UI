const options = {
  plugins: [
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-nullish-coalescing-operator'
  ]
}

const vueCliPreset = require('@vue/cli-plugin-babel/preset')

module.exports = api => {
  api.cache.using(() => process.env.VUE_CLI_MODERN_BUILD)
  api.cache.using(() => process.env.NODE_ENV)

  const isModern = process.env.VUE_CLI_MODERN_BUILD === 'true'

  if (isModern) {
    delete process.env.VUE_CLI_MODERN_BUILD
  }
  const config = vueCliPreset(api)
  if (isModern) {
    process.env.VUE_CLI_MODERN_BUILD = 'true'
  }

  return { ...options, ...config }
}
