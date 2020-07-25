import deepmerge from 'deepmerge'

const merge = (a, b, c) => deepmerge(b, c)

export default merge
