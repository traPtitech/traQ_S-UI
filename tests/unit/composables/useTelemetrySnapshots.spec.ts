import { effectScope, nextTick, ref } from 'vue'

import { useTelemetrySnapshots } from '/@/composables/useTelemetrySnapshots'

const { settings, me, track, trackClientEnvironmentSnapshot } = vi.hoisted(
  () => ({
    settings: vi.fn(),
    me: vi.fn(),
    track: vi.fn(),
    trackClientEnvironmentSnapshot: vi.fn()
  })
)

vi.mock('/@/lib/telemetry', () => ({
  telemetry: { track, trackClientEnvironmentSnapshot }
}))
vi.mock('/@/store/domain/me', () => ({ useMeStore: me }))
vi.mock('/@/store/app/featureFlagSettings', () => ({
  featureFlagDescriptions: { flag_test: {} },
  useFeatureFlagSettings: settings
}))

describe('useTelemetrySnapshots', () => {
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
    trackClientEnvironmentSnapshot.mockReset()
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
    scope.run(useTelemetrySnapshots)
  })

  afterEach(() => {
    scope.stop()
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('records the environment immediately and waits for restored flag settings', async () => {
    expect(track).not.toHaveBeenCalled()
    expect(trackClientEnvironmentSnapshot).toHaveBeenCalledOnce()

    enabled = true
    restoring.value = false
    await nextTick()

    expect(trackClientEnvironmentSnapshot).toHaveBeenCalledOnce()
    expect(track).toHaveBeenCalledExactlyOnceWith('feature_flag_snapshot', {
      flag: 'flag_test',
      enabled: true,
      source: 'override'
    })
    enabled = false
    await vi.advanceTimersByTimeAsync(15 * 60 * 1000)

    expect(trackClientEnvironmentSnapshot).toHaveBeenCalledTimes(2)
    expect(track).toHaveBeenCalledTimes(2)
    expect(track).toHaveBeenLastCalledWith('feature_flag_snapshot', {
      flag: 'flag_test',
      enabled: false,
      source: 'override'
    })
  })

  it('skips hidden pages, resumes on visibility and stops on disposal', async () => {
    await setVisibility('hidden')
    trackClientEnvironmentSnapshot.mockClear()
    restoring.value = false
    await nextTick()
    await vi.advanceTimersByTimeAsync(30 * 60 * 1000)
    expect(track).not.toHaveBeenCalled()
    expect(trackClientEnvironmentSnapshot).not.toHaveBeenCalled()

    await setVisibility('visible')
    expect(track).toHaveBeenCalledOnce()
    expect(trackClientEnvironmentSnapshot).toHaveBeenCalledOnce()

    scope.stop()
    await vi.advanceTimersByTimeAsync(15 * 60 * 1000)
    expect(track).toHaveBeenCalledOnce()
    expect(trackClientEnvironmentSnapshot).toHaveBeenCalledOnce()
  })

  it('waits for login and stops taking snapshots after logout', async () => {
    myId.value = undefined
    trackClientEnvironmentSnapshot.mockClear()
    restoring.value = false
    await nextTick()
    await vi.advanceTimersByTimeAsync(15 * 60 * 1000)
    expect(track).not.toHaveBeenCalled()
    expect(trackClientEnvironmentSnapshot).not.toHaveBeenCalled()

    myId.value = 'test-user'
    await nextTick()
    expect(trackClientEnvironmentSnapshot).toHaveBeenCalledOnce()
    expect(track).toHaveBeenCalledExactlyOnceWith('feature_flag_snapshot', {
      flag: 'flag_test',
      enabled: false,
      source: 'override'
    })

    myId.value = undefined
    await nextTick()
    await vi.advanceTimersByTimeAsync(15 * 60 * 1000)
    expect(track).toHaveBeenCalledOnce()
    expect(trackClientEnvironmentSnapshot).toHaveBeenCalledOnce()
  })
})
