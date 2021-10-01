const { process: esProcess } = require('es-jest')

/**
 * import.meta.envをprocess.envに置き換える
 * その後にesbuildでTSをJS(CommonJS)に変換する
 */
exports.process = (src, filename) => {
  replacedSrc = src.replace(/import\.meta\.env/g, 'process.env')
  const code = esProcess(replacedSrc, filename)
  return code
}
