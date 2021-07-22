const { process: sucraseProcess } = require('@sucrase/jest-plugin')

/**
 * import.meta.envをprocess.envに置き換える
 * その後にsucraseでTSをJS(CommonJS)に変換する
 */
exports.process = (src, filename) => {
  replacedSrc = src.replace(/import\.meta\.env/g, 'process.env')
  const code = sucraseProcess(replacedSrc, filename)
  return code
}
