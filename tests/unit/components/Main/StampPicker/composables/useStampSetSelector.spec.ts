import { computed, nextTick, ref } from 'vue'

import { createPinia, disposePinia, setActivePinia } from 'pinia'

import useStampSetSelector from '/@/components/Main/StampPicker/composables/useStampSetSelector'
import {
  type StampSet,
  getStampSetKey,
  useStampPickerSettings
} from '/@/store/ui/stampPickerSettings'

const recommendationsEnabled = ref(true)
const currentStampSet = ref<StampSet>({ type: 'recommendation', id: '' })
const palette = {
  id: 'my-palette',
  name: 'パレット',
  stamps: ['d', 'c', 'b', 'a']
}
const stampPalettesMap = ref(new Map([[palette.id, palette]]))

vi.mock('/@/store/app/featureFlagSettings', () => ({
  useFeatureFlagSettings: () => ({
    featureFlags: computed(() => ({
      stamp_recommendation_v3: { enabled: recommendationsEnabled.value }
    }))
  })
}))
vi.mock('/@/store/domain/stampCategory', () => ({
  useStampCategory: () => ({
    traQStampCategory: ref({ name: 'traq', stampIds: [] }),
    unicodeStampCategories: ref([{ name: 'people', stampIds: [] }])
  })
}))
vi.mock('/@/store/domain/stampHistory', () => ({
  useStampHistory: () => ({ recentStampIds: ref(['b', 'a', 'd']) })
}))
vi.mock('/@/store/domain/stampRecommendations', () => ({
  useStampRecommendations: () => ({
    stampRecommendations: ref(['a', 'b', 'c'])
  })
}))
vi.mock('/@/store/entities/stampPalettes', () => ({
  useStampPalettesStore: () => ({
    stampPalettesMap,
    nonEmptyStampPaletteIds: computed(() => [...stampPalettesMap.value.keys()])
  })
}))
vi.mock('/@/store/entities/stamps', () => ({
  useStampsStore: () => ({
    initialRecentStamps: ref([]),
    stampsMap: ref(new Map(['a', 'b', 'c', 'd'].map(id => [id, { id }])))
  })
}))
vi.mock('/@/store/ui/stampPicker', () => ({
  useStampPicker: () => ({ currentStampSet })
}))

describe('stamp picker settings', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    localStorage.clear()
    recommendationsEnabled.value = true
    currentStampSet.value = { type: 'recommendation', id: '' }
    stampPalettesMap.value = new Map([[palette.id, palette]])
    pinia = createPinia()
    setActivePinia(pinia)
    useStampPickerSettings(pinia)
  })

  afterEach(() => {
    disposePinia(pinia)
  })

  it('shows both personal tabs and restores their saved order and quick reaction source', async () => {
    const { stampSets, selectedStampSet, tabOrder } = useStampSetSelector()
    const { quickReactionSource } = useStampPickerSettings()
    const initialOrder = [
      'recommendation',
      'history',
      'palette:my-palette',
      'category:traq',
      'category:unicode-people'
    ]
    expect(stampSets.value.map(getStampSetKey)).toEqual(initialOrder)

    const reordered = [
      'history',
      'palette:my-palette',
      'category:traq',
      'category:unicode-people',
      'recommendation'
    ]
    tabOrder.value = reordered
    quickReactionSource.value = 'palette:my-palette'
    await nextTick()
    expect(stampSets.value.map(getStampSetKey)).toEqual(reordered)
    expect(selectedStampSet.value.type).toBe('recommendation')

    disposePinia(pinia)
    pinia = createPinia()
    setActivePinia(pinia)
    useStampPickerSettings(pinia)
    expect(useStampSetSelector().stampSets.value.map(getStampSetKey)).toEqual(
      reordered
    )
    expect(useStampPickerSettings().quickReactionStampIds.value).toEqual([
      'd',
      'c',
      'b'
    ])
  })

  it('changes quick reactions independently and falls back when the selected source is unavailable', () => {
    const { stampSets, selectedStampSet } = useStampSetSelector()
    const { quickReactionSource, quickReactionStampIds } =
      useStampPickerSettings()

    expect(quickReactionStampIds.value).toEqual(['a', 'b', 'c'])
    quickReactionSource.value = 'history'
    expect(quickReactionStampIds.value).toEqual(['b', 'a', 'd'])
    expect(selectedStampSet.value.type).toBe('recommendation')

    quickReactionSource.value = 'palette:my-palette'
    expect(quickReactionStampIds.value).toEqual(['d', 'c', 'b'])

    recommendationsEnabled.value = false
    expect(stampSets.value.map(tab => tab.type)).toEqual([
      'history',
      'palette',
      'category',
      'category'
    ])
    expect(selectedStampSet.value.type).toBe('history')
    expect(quickReactionStampIds.value).toEqual(['b', 'a', 'd'])

    recommendationsEnabled.value = true
    expect(quickReactionStampIds.value).toEqual(['d', 'c', 'b'])
    stampPalettesMap.value.delete(palette.id)
    expect(quickReactionSource.value).toBe('recommendation')
    expect(quickReactionStampIds.value).toEqual(['a', 'b', 'c'])
  })
})
