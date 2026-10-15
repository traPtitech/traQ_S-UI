import { OAuth2Scope } from '@traptitech/traq'

import { getScopeInfo, isKnownScope, scopeInfoMap } from '/@/lib/clientScope'

describe('getScopeInfo', () => {
  it.each(Object.values(OAuth2Scope))('returns info of %s', scope => {
    expect(getScopeInfo(scope)).toBe(scopeInfoMap[scope])
  })

  it('returns info of qall', () => {
    expect(getScopeInfo('qall').name).toBe('通話 (Qall)')
  })

  it.each(['unknown_scope', 'toString', '__proto__'])(
    'returns the scope name for unknown scope %s',
    scope => {
      expect(getScopeInfo(scope)).toEqual({ name: scope, permissions: [] })
    }
  )
})

describe('isKnownScope', () => {
  it.each([...Object.values(OAuth2Scope), 'qall'])(
    'returns true for %s',
    scope => {
      expect(isKnownScope(scope)).toBe(true)
    }
  )

  it.each(['unknown_scope', 'toString', '__proto__'])(
    'returns false for %s',
    scope => {
      expect(isKnownScope(scope)).toBe(false)
    }
  )
})
