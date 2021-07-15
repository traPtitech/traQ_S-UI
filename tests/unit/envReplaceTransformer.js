const esbuildTransformerObj = require('esbuild-jest')

const createTransformer = options => {
  const esbuildTransformer = esbuildTransformerObj.createTransformer(options)
  return {
    process(content, filename, config, opts) {
      const { code, map } = esbuildTransformer.process(
        content,
        filename,
        config,
        opts
      )
      return {
        code: code.replace(/import[._]meta\.env/g, '{/*   env   */}'),
        map
      }
    }
  }
}

module.exports = {
  canInstrument: true,
  createTransformer
}
