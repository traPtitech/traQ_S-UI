import { createPinia, setActivePinia } from 'pinia'

import { useFeatureFlagSettings } from '/@/store/app/featureFlagSettings'

vi.mock('/@/composables/storage/useIndexedDbValue', async () => {
  const { reactive, ref } = await vi.importActual<{
    reactive: <T extends object>(target: T) => T
    ref: <T>(value: T) => { value: T }
  }>('vue')

  return {
    default: () => [
      reactive({ status: new Map([['stamp_recommendation', false]]) }),
      ref(false),
      Promise.resolve()
    ]
  }
})

describe('stamp recommendation feature flag', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-29T00:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts enabled despite the old disabled flag, then respects a new choice', async () => {
    const { featureFlags, updateFeatureFlagStatus } = useFeatureFlagSettings()

    expect(featureFlags.value.stamp_recommendation_v2.enabled).toBe(true)

    await updateFeatureFlagStatus('stamp_recommendation_v2', false)

    expect(featureFlags.value.stamp_recommendation_v2.enabled).toBe(false)
  })
})
