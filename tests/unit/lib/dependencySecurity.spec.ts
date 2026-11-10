import { createRequire } from 'node:module'

import { DEFAULTS } from '@rollup/plugin-node-resolve'

const requireFromTest = createRequire(import.meta.url)
const requireFromResolver = createRequire(
  requireFromTest.resolve('@rollup/plugin-node-resolve')
)

describe('Build dependency security', () => {
  it('does not inherit properties from nested prototype keys', () => {
    const merge = requireFromResolver('deepmerge')
    const input = JSON.parse('{"session":{"__proto__":{"admin":true}}}')
    const result = merge({ session: null }, input)

    expect(result.session).not.toHaveProperty('admin')
    expect(result.session).not.toHaveProperty('__proto__.admin')
    expect({}).not.toHaveProperty('admin')
  })

  it('preserves frozen resolver defaults in both module entry points', () => {
    const commonjsDefaults = requireFromTest(
      '@rollup/plugin-node-resolve'
    ).DEFAULTS

    expect(DEFAULTS.extensions).toEqual(['.mjs', '.js', '.json', '.node'])
    expect(commonjsDefaults).toEqual(DEFAULTS)
    expect(Object.isFrozen(DEFAULTS)).toBe(true)
    expect(Object.isFrozen(DEFAULTS.extensions)).toBe(true)
    expect(Object.isFrozen(commonjsDefaults)).toBe(true)
    expect(Object.isFrozen(commonjsDefaults.extensions)).toBe(true)
  })
})
