import { computed } from 'vue'

import { useStampCategory } from '/@/store/domain/stampCategory'
import { useStampPicker } from '/@/store/ui/stampPicker'
import {
  type StampPickerTab,
  type StampSet,
  getStampSetKey,
  useStampPickerSettings
} from '/@/store/ui/stampPickerSettings'

const useStampSetSelector = () => {
  const { traQStampCategory, unicodeStampCategories } = useStampCategory()
  const { currentStampSet } = useStampPicker()
  const { defaultTab, personalTabs, tabOrder, isRecommendationEnabled } =
    useStampPickerSettings()

  const stampSets = computed((): StampPickerTab[] => {
    const tabs: StampPickerTab[] = [
      ...personalTabs.value,
      { type: 'category', id: traQStampCategory.value.name, label: 'traQ' },
      ...unicodeStampCategories.value.map(({ name }) => ({
        type: 'category' as const,
        id: `unicode-${name}`,
        label: name
      }))
    ]

    if (!isRecommendationEnabled.value) return tabs

    const positions = new Map(tabOrder.value.map((key, index) => [key, index]))
    return tabs.sort(
      (a, b) =>
        (positions.get(getStampSetKey(a)) ?? positions.size) -
        (positions.get(getStampSetKey(b)) ?? positions.size)
    )
  })

  const selectedStampSet = computed<StampSet>({
    get: () => {
      const key = getStampSetKey(currentStampSet.value)
      return (
        stampSets.value.find(tab => getStampSetKey(tab) === key) ??
        defaultTab.value
      )
    },
    set: (tab: StampSet) => {
      currentStampSet.value = tab
    }
  })

  return { stampSets, selectedStampSet, tabOrder }
}

export default useStampSetSelector
