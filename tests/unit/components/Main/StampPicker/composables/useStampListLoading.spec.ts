import type { Stamp } from '@traptitech/traq'

import { computed, effectScope, nextTick, ref } from 'vue'

import { createPinia, setActivePinia } from 'pinia'

import useStampList from '/@/components/Main/StampPicker/composables/useStampList'
import type { StampSet } from '/@/components/Main/StampPicker/composables/useStampSetSelector'
import { useStampHistory } from '/@/store/domain/stampHistory'
import { useStampRecommendations } from '/@/store/domain/stampRecommendations'
import { useStampsStore } from '/@/store/entities/stamps'

type RecommendationsResponse = {
  data: { stampId: string; score: number }[]
}
type HistoryResponse = {
  data: { stampId: string; datetime: string }[]
}

const { mockGetRecommendations, mockGetHistory } = vi.hoisted(() => ({
  mockGetRecommendations: vi.fn<() => Promise<RecommendationsResponse>>(),
  mockGetHistory: vi.fn<() => Promise<HistoryResponse>>()
}))

vi.mock('/@/lib/apis', () => ({
  default: {
    getMyStampRecommendations: mockGetRecommendations,
    getMyStampHistory: mockGetHistory
  }
}))
vi.mock('/@/store/app/featureFlagSettings', () => ({
  useFeatureFlagSettings: () => ({
    featureFlags: computed(() => ({
      stamp_recommendation_v2: { enabled: recommendationsEnabled.value }
    }))
  })
}))
vi.mock('/@/store/domain/stampCategory', async () => {
  const { ref } = await import('vue')
  return {
    useStampCategory: () => ({
      traQStampCategory: ref({ name: 'traq', stampIds: ['a', 'b', 'c'] }),
      unicodeStampCategories: ref([])
    })
  }
})
vi.mock('/@/store/entities/stampPalettes', async () => {
  const { ref } = await import('vue')
  return {
    useStampPalettesStore: () => ({ stampPalettesMap: ref(new Map()) })
  }
})
vi.mock('/@/store/entities/stamps', () => ({
  useStampsStore: vi.fn()
}))

const recommendationsEnabled = ref(true)

describe('useStampList with stamp stores', () => {
  const stampsMap = ref(new Map<string, Stamp>())
  const stampsMapFetched = ref(true)
  const scopes: ReturnType<typeof effectScope>[] = []

  const openPicker = () => {
    const scope = effectScope()
    scopes.push(scope)
    const picker = scope.run(() =>
      useStampList(ref<StampSet>({ type: 'history', id: '' }))
    )
    if (!picker) throw new Error('Picker scope is inactive')
    return picker
  }

  beforeEach(() => {
    vi.useFakeTimers()
    mockGetRecommendations.mockReset()
    mockGetHistory.mockReset()
    recommendationsEnabled.value = true
    stampsMapFetched.value = true
    stampsMap.value = new Map(stamps.map(stamp => [stamp.id, stamp]))
    vi.mocked(useStampsStore, { partial: true }).mockReturnValue({
      stampsMap,
      stampsMapFetched
    })
    const pinia = createPinia()
    setActivePinia(pinia)
    useStampRecommendations(pinia)
    useStampHistory(pinia)
  })

  afterEach(() => {
    for (const scope of scopes.splice(0)) scope.stop()
    vi.useRealTimers()
  })

  it.each([true, false])(
    'freezes only recommendations after usage (recommendations enabled: %s)',
    async enabled => {
      recommendationsEnabled.value = enabled
      mockGetRecommendations.mockResolvedValue({
        data: [
          { stampId: 'a', score: 2 },
          { stampId: 'b', score: 1 }
        ]
      })
      mockGetHistory.mockResolvedValue({
        data: [
          { stampId: 'a', datetime: new Date(2000).toISOString() },
          { stampId: 'b', datetime: new Date(1000).toISOString() }
        ]
      })
      const { recordStampUsage, fetchStampRecommendations } =
        useStampRecommendations()
      const { upsertLocalStampHistory, fetchStampHistory } = useStampHistory()
      await (enabled ? fetchStampRecommendations() : fetchStampHistory())
      const picker = openPicker()
      expect(picker.stamps.value.map(stamp => stamp.id)).toEqual(['a', 'b'])

      recordStampUsage('b')
      upsertLocalStampHistory('b', new Date(3000))
      await nextTick()
      expect(picker.stamps.value.map(stamp => stamp.id)).toEqual(
        enabled ? ['a', 'b'] : ['b', 'a']
      )

      recordStampUsage('c')
      upsertLocalStampHistory('c', new Date(4000))
      await nextTick()
      expect(picker.stamps.value.map(stamp => stamp.id)).toEqual(
        enabled ? ['a', 'b'] : ['c', 'b', 'a']
      )
    }
  )

  it('releases the frozen list when recommendations are disabled while open', async () => {
    mockGetRecommendations.mockResolvedValue({
      data: [
        { stampId: 'a', score: 2 },
        { stampId: 'b', score: 1 }
      ]
    })
    mockGetHistory.mockResolvedValue({
      data: [
        { stampId: 'b', datetime: new Date(2000).toISOString() },
        { stampId: 'a', datetime: new Date(1000).toISOString() }
      ]
    })
    await useStampRecommendations().fetchStampRecommendations()
    const { fetchStampHistory, upsertLocalStampHistory } = useStampHistory()
    await fetchStampHistory()
    const picker = openPicker()
    expect(picker.stamps.value.map(stamp => stamp.id)).toEqual(['a', 'b'])

    recommendationsEnabled.value = false
    await nextTick()
    expect(picker.stamps.value.map(stamp => stamp.id)).toEqual(['b', 'a'])

    upsertLocalStampHistory('a', new Date(3000))
    await nextTick()
    expect(picker.stamps.value.map(stamp => stamp.id)).toEqual(['a', 'b'])
  })

  it.each([true, false])(
    'accepts the fetched list after local usage (recommendations enabled: %s)',
    async enabled => {
      recommendationsEnabled.value = enabled
      const recommendations = Promise.withResolvers<RecommendationsResponse>()
      const history = Promise.withResolvers<HistoryResponse>()
      mockGetRecommendations.mockReturnValue(recommendations.promise)
      mockGetHistory.mockReturnValue(history.promise)
      const { recordStampUsage, fetchStampRecommendations } =
        useStampRecommendations()
      const { upsertLocalStampHistory, fetchStampHistory } = useStampHistory()
      const fetching = enabled
        ? fetchStampRecommendations()
        : fetchStampHistory()
      const picker = openPicker()

      picker.filterState.query = 'cc'
      expect(picker.stamps.value.map(stamp => stamp.id)).toEqual(['c'])
      recordStampUsage('c')
      upsertLocalStampHistory('c', new Date())
      await nextTick()
      picker.filterState.query = ''
      expect(picker.stamps.value.map(stamp => stamp.id)).toEqual(['c'])

      recommendations.resolve({
        data: ['a', 'b', 'c'].map((stampId, index) => ({
          stampId,
          score: 3 - index
        }))
      })
      history.resolve({
        data: ['a', 'b', 'c'].map((stampId, index) => ({
          stampId,
          datetime: new Date(3000 - index * 1000).toISOString()
        }))
      })
      await fetching
      await nextTick()
      expect(picker.stamps.value.map(stamp => stamp.id)).toEqual([
        'a',
        'b',
        'c'
      ])
    }
  )

  it('waits for all stamps before freezing fetched recommendations', async () => {
    stampsMapFetched.value = false
    stampsMap.value.delete('a')
    stampsMap.value.delete('b')
    mockGetRecommendations.mockResolvedValue({
      data: ['a', 'b', 'c'].map((stampId, index) => ({
        stampId,
        score: 3 - index
      }))
    })
    const picker = openPicker()
    await useStampRecommendations().fetchStampRecommendations()
    await nextTick()
    expect(picker.stamps.value.map(stamp => stamp.id)).toEqual(['c'])

    stampsMap.value = new Map(stamps.map(stamp => [stamp.id, stamp]))
    stampsMapFetched.value = true
    await nextTick()
    expect(picker.stamps.value.map(stamp => stamp.id)).toEqual(['a', 'b', 'c'])
  })
})

const stamps: Stamp[] = ['a', 'b', 'c'].map(id => ({
  id,
  name: id.repeat(2),
  fileId: `${id}-file`,
  isUnicode: false,
  creatorId: 'user',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z'
}))
