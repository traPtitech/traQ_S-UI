import { reactive, ref } from 'vue'

import { createPinia, disposePinia } from 'pinia'

import type { FeatureFlagKey } from '/@/store/app/featureFlagSettings'
import { useFeatureFlagSettings } from '/@/store/app/featureFlagSettings'

const { indexedDb, track } = vi.hoisted(() => ({
  indexedDb: vi.fn(),
  track: vi.fn()
}))

vi.mock('/@/composables/storage/useIndexedDbValue', () => ({
  default: indexedDb
}))
vi.mock('/@/lib/telemetry', () => ({ telemetry: { track } }))
vi.mock('/@/lib/dom/browser', () => ({ isWebKit: () => true }))

describe('feature flag telemetry', () => {
  let pinia: ReturnType<typeof createPinia>
  let store: ReturnType<typeof useFeatureFlagSettings>
  let restore: (status?: Map<FeatureFlagKey, boolean>) => void

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-25T00:00:00Z'))
    track.mockReset()
    pinia = createPinia()
    const state = reactive({ status: new Map<FeatureFlagKey, boolean>() })
    const restoring = ref(true)
    const promise = new Promise<void>(resolve => {
      restore = status => {
        if (status) state.status = status
        restoring.value = false
        resolve()
      }
    })
    indexedDb.mockReturnValue([state, restoring, promise])
    store = useFeatureFlagSettings(pinia)
  })

  afterEach(() => {
    disposePinia(pinia)
    vi.useRealTimers()
  })

  it('distinguishes browser defaults and saved overrides without recording reads', () => {
    restore(new Map([['flag_test', true]]))

    expect(store.getFeatureFlagState('contain_strict_alternate')).toEqual({
      enabled: true,
      source: 'default'
    })
    expect(store.getFeatureFlagState('flag_test')).toEqual({
      enabled: true,
      source: 'override'
    })
    expect(store.featureFlags.value.flag_test.enabled).toBe(true)
    expect(track).not.toHaveBeenCalled()
  })

  it('waits for restoration and only records an effective state change', async () => {
    const update = store.updateFeatureFlagStatus('flag_test', false)
    await Promise.resolve()
    expect(track).not.toHaveBeenCalled()

    restore(new Map([['flag_test', true]]))
    await update
    await store.updateFeatureFlagStatus('flag_test', false)

    expect(track).toHaveBeenCalledExactlyOnceWith('feature_flag_changed', {
      flag: 'flag_test',
      enabled: false,
      previous_enabled: true
    })
  })

  it('does not count an explicit choice matching the browser default as a change', async () => {
    restore()
    await store.updateFeatureFlagStatus('contain_strict_alternate', true)

    expect(store.getFeatureFlagState('contain_strict_alternate').source).toBe(
      'override'
    )
    expect(track).not.toHaveBeenCalled()
  })

  it('reports expired flags as disabled even when an override is enabled', async () => {
    restore(new Map([['flag_test', true]]))
    vi.setSystemTime(new Date('+010000-01-01T00:00:00Z'))
    await store.updateFeatureFlagStatus('flag_test', true)

    expect(store.getFeatureFlagState('flag_test')).toEqual({
      enabled: false,
      source: 'expired'
    })
    expect(track).not.toHaveBeenCalled()
  })
})
