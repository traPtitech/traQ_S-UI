/*
  const data = import('a.json')
  でdata.defaultにアクセスする必要があるため
*/
exports.process = (src, filename) => {
  return `{"default":${src}}`
}
