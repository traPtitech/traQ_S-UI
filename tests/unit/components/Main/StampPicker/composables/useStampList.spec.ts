import type { Stamp } from '@traptitech/traq'

import { computed, effectScope, nextTick, ref } from 'vue'

import useStampList from '/@/components/Main/StampPicker/composables/useStampList'
import type { StampSet } from '/@/components/Main/StampPicker/composables/useStampSetSelector'
import { useStampCategory } from '/@/store/domain/stampCategory'
import { useTopStampIds } from '/@/store/domain/stampRecommendations'
import { useStampPalettesStore } from '/@/store/entities/stampPalettes'
import { useStampsStore } from '/@/store/entities/stamps'

vi.mock('/@/store/domain/stampCategory', () => ({
  useStampCategory: vi.fn()
}))
vi.mock('/@/store/domain/stampRecommendations', () => ({
  useTopStampIds: vi.fn()
}))
vi.mock('/@/store/entities/stampPalettes', () => ({
  useStampPalettesStore: vi.fn()
}))
vi.mock('/@/store/entities/stamps', () => ({
  useStampsStore: vi.fn()
}))

describe('useStampList', () => {
  const topStampIds = ref<string[]>([])
  const stampsMap = ref(new Map<string, Stamp>())
  const scopes: ReturnType<typeof effectScope>[] = []

  const openPicker = () => {
    const scope = effectScope()
    scopes.push(scope)
    const currentStampSet = ref<StampSet>({ type: 'history', id: '' })
    const list = scope.run(() => useStampList(currentStampSet))
    if (!list) throw new Error('Picker scope is inactive')
    return { ...list, currentStampSet, close: () => scope.stop() }
  }

  beforeEach(() => {
    topStampIds.value = ['a', 'b']
    stampsMap.value = new Map(['a', 'b', 'c'].map(id => [id, createStamp(id)]))
    vi.mocked(useTopStampIds).mockReturnValue({
      topStampIds: computed(() => topStampIds.value)
    })
    vi.mocked(useStampsStore, { partial: true }).mockReturnValue({ stampsMap })
    vi.mocked(useStampCategory, { partial: true }).mockReturnValue({
      traQStampCategory: ref({ name: 'traq', stampIds: ['a', 'b', 'c'] }),
      unicodeStampCategories: ref([])
    })
    vi.mocked(useStampPalettesStore, { partial: true }).mockReturnValue({
      stampPalettesMap: ref(new Map())
    })
  })

  afterEach(() => {
    for (const scope of scopes.splice(0)) scope.stop()
  })

  it('keeps the order while open and uses the latest order when reopened', async () => {
    const picker = openPicker()
    expect(picker.stamps.value.map(stamp => stamp.id)).toEqual(['a', 'b'])

    topStampIds.value = ['b', 'c', 'a']
    await nextTick()

    expect(picker.stamps.value.map(stamp => stamp.id)).toEqual(['a', 'b'])

    picker.close()
    const reopened = openPicker()
    expect(reopened.stamps.value.map(stamp => stamp.id)).toEqual([
      'b',
      'c',
      'a'
    ])
  })

  it('keeps the order after searching and switching stamp sets', async () => {
    const picker = openPicker()
    topStampIds.value = ['b', 'a']
    await nextTick()

    picker.filterState.query = 'cc'
    expect(picker.stamps.value.map(stamp => stamp.id)).toEqual(['c'])
    picker.filterState.query = ''
    expect(picker.stamps.value.map(stamp => stamp.id)).toEqual(['a', 'b'])

    picker.currentStampSet.value = { type: 'category', id: 'traq' }
    expect(picker.stamps.value.map(stamp => stamp.id)).toEqual(['a', 'b', 'c'])
    picker.currentStampSet.value = { type: 'history', id: '' }
    expect(picker.stamps.value.map(stamp => stamp.id)).toEqual(['a', 'b'])
  })

  it('shows the first fetched list if opened before recommendations load', async () => {
    topStampIds.value = []
    const picker = openPicker()
    expect(picker.stamps.value).toEqual([])

    topStampIds.value = ['b', 'a']
    await nextTick()
    expect(picker.stamps.value.map(stamp => stamp.id)).toEqual(['b', 'a'])

    topStampIds.value = ['a', 'b']
    await nextTick()
    expect(picker.stamps.value.map(stamp => stamp.id)).toEqual(['b', 'a'])
  })

  it('omits stamps deleted while the picker is open', () => {
    const picker = openPicker()
    stampsMap.value.delete('a')

    expect(picker.stamps.value.map(stamp => stamp.id)).toEqual(['b'])
  })
})

const createStamp = (id: string): Stamp => ({
  id,
  name: id.repeat(2),
  fileId: `${id}-file`,
  isUnicode: false,
  creatorId: 'user',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z'
})
