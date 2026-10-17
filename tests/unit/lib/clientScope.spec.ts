import { OAuth2Scope } from '@traptitech/traq'

import { isKnownScope } from '/@/lib/clientScope'

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
