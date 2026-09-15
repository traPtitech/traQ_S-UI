import { type EffectScope, effectScope } from 'vue'

import { useDateRepresentation } from '/@/composables/useDateRepresentation'

describe('useDateRepresentation', () => {
  const scopes: EffectScope[] = []

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    scopes.forEach(scope => scope.stop())
    scopes.length = 0
    vi.useRealTimers()
  })

  const createDateRepresentation = (date: Readonly<Date> | string) => {
    const scope = effectScope()
    scopes.push(scope)
    const dateRepresentation = scope.run(() => useDateRepresentation(date))
    if (!dateRepresentation) throw new Error('Failed to create effect scope')
    return dateRepresentation
  }

  it('updates when the date changes', () => {
    vi.setSystemTime(new Date(2025, 0, 1, 23, 59, 59))
    const date = createDateRepresentation(new Date(2025, 0, 1, 12, 34))

    expect(date.value).toBe('今日 12:34')

    vi.advanceTimersByTime(1000)

    expect(date.value).toBe('昨日 12:34')
  })

  it('shares a single timer between consumers', () => {
    createDateRepresentation('2025-01-01T12:34:00Z')
    createDateRepresentation('2025-01-01T12:35:00Z')

    expect(vi.getTimerCount()).toBe(1)
  })
})
