/* eslint-disable @typescript-eslint/no-var-requires */
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

  return config
}
