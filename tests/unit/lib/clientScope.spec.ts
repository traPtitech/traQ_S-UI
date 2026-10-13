import { OAuth2Scope } from '@traptitech/traq'

import { getScopeInfo, scopeInfoMap } from '/@/lib/clientScope'

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
