import { effectScope, nextTick, ref } from 'vue'

import { useFeatureFlagTelemetry } from '/@/composables/useFeatureFlagTelemetry'

const { settings, me, track } = vi.hoisted(() => ({
  settings: vi.fn(),
  me: vi.fn(),
  track: vi.fn()
}))

vi.mock('/@/lib/telemetry', () => ({ telemetry: { track } }))
vi.mock('/@/store/domain/me', () => ({ useMeStore: me }))
vi.mock('/@/store/app/featureFlagSettings', () => ({
  featureFlagDescriptions: { flag_test: {} },
  useFeatureFlagSettings: settings
}))

describe('useFeatureFlagTelemetry', () => {
  let scope: ReturnType<typeof effectScope>
  const restoring = ref(true)
  const myId = ref<string>()
  let visibility: DocumentVisibilityState
  let enabled: boolean

  const setVisibility = async (value: DocumentVisibilityState) => {
    visibility = value
    document.dispatchEvent(new Event('visibilitychange'))
    await nextTick()
  }

  beforeEach(() => {
    vi.useFakeTimers()
    track.mockReset()
    restoring.value = true
    myId.value = 'test-user'
    enabled = false
    visibility = 'visible'
    vi.spyOn(document, 'visibilityState', 'get').mockImplementation(
      () => visibility
    )
    settings.mockReturnValue({
      restoring,
      getFeatureFlagState: () => ({ enabled, source: 'override' })
    })
    me.mockReturnValue({ myId })
    scope = effectScope()
    scope.run(useFeatureFlagTelemetry)
  })

  afterEach(() => {
    scope.stop()
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('records the restored state and refreshes it while visible', async () => {
    expect(track).not.toHaveBeenCalled()
    enabled = true
    restoring.value = false
    await nextTick()

    expect(track).toHaveBeenCalledExactlyOnceWith('feature_flag_snapshot', {
      flag: 'flag_test',
      enabled: true,
      source: 'override'
    })
    enabled = false
    await vi.advanceTimersByTimeAsync(15 * 60 * 1000)
    expect(track).toHaveBeenCalledTimes(2)
    expect(track).toHaveBeenLastCalledWith('feature_flag_snapshot', {
      flag: 'flag_test',
      enabled: false,
      source: 'override'
    })
  })

  it('skips hidden pages, resumes on visibility and stops on disposal', async () => {
    await setVisibility('hidden')
    restoring.value = false
    await nextTick()
    await vi.advanceTimersByTimeAsync(30 * 60 * 1000)
    expect(track).not.toHaveBeenCalled()

    await setVisibility('visible')
    expect(track).toHaveBeenCalledOnce()
    scope.stop()
    await vi.advanceTimersByTimeAsync(15 * 60 * 1000)
    expect(track).toHaveBeenCalledOnce()
  })

  it('waits for login and stops taking snapshots after logout', async () => {
    myId.value = undefined
    restoring.value = false
    await nextTick()
    await vi.advanceTimersByTimeAsync(15 * 60 * 1000)
    expect(track).not.toHaveBeenCalled()

    myId.value = 'test-user'
    await nextTick()
    expect(track).toHaveBeenCalledExactlyOnceWith('feature_flag_snapshot', {
      flag: 'flag_test',
      enabled: false,
      source: 'override'
    })

    myId.value = undefined
    await nextTick()
    await vi.advanceTimersByTimeAsync(15 * 60 * 1000)
    expect(track).toHaveBeenCalledOnce()
  })
})
