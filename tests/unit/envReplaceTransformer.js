const { process: sucraseProcess } = require('@sucrase/jest-plugin')

exports.process = (src, filename) => {
  // if (filename.endsWith(".vue")) {
  //   filename = filename.slice(0, -'.vue'.length) + '.ts'
  // }
  const code = sucraseProcess(src, filename)
  return code.replace(/import[._]meta\.env/g, '{/*   env   */}')
}
