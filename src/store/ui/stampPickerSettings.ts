import { computed, toRef } from 'vue'

import { acceptHMRUpdate, defineStore } from 'pinia'

import useLocalStorageValue from '/@/composables/storage/useLocalStorage'
import { isDefined } from '/@/lib/basic/array'
import { useFeatureFlagSettings } from '/@/store/app/featureFlagSettings'
import { useStampHistory } from '/@/store/domain/stampHistory'
import { useStampRecommendations } from '/@/store/domain/stampRecommendations'
import { useStampPalettesStore } from '/@/store/entities/stampPalettes'
import { useStampsStore } from '/@/store/entities/stamps'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'

export type StampSet = {
  type: 'recommendation' | 'history' | 'palette' | 'category'
  id: string
}

export type StampPickerTab = StampSet & { label: string }

const recommendationTab = {
  type: 'recommendation',
  id: '',
  label: 'レコメンデーション'
} as const satisfies StampPickerTab

const historyTab = {
  type: 'history',
  id: '',
  label: '最近使ったスタンプ'
} as const satisfies StampPickerTab

export const getStampSetKey = ({ type, id }: StampSet) =>
  id ? `${type}:${id}` : type

const QUICK_REACTION_COUNT = 3

const useStampPickerSettingsPinia = defineStore(
  'ui/stampPickerSettings',
  () => {
    const [settings] = useLocalStorageValue(
      'store/ui/stampPickerSettings',
      1,
      {},
      {
        tabOrder: [] as string[],
        quickReactionSource: recommendationTab.type as string
      }
    )

    const { featureFlags } = useFeatureFlagSettings()
    const { stampPalettesMap, nonEmptyStampPaletteIds } =
      useStampPalettesStore()
    const { stampRecommendations } = useStampRecommendations()
    const { recentStampIds } = useStampHistory()
    const { initialRecentStamps, stampsMap } = useStampsStore()

    const isRecommendationEnabled = computed(
      () => featureFlags.value.stamp_recommendation_v3.enabled
    )
    const defaultTab = computed(() =>
      isRecommendationEnabled.value ? recommendationTab : historyTab
    )
    const personalTabs = computed((): StampPickerTab[] => [
      ...(isRecommendationEnabled.value ? [recommendationTab] : []),
      historyTab,
      ...nonEmptyStampPaletteIds.value
        .map(id => stampPalettesMap.value.get(id))
        .filter(isDefined)
        .map(palette => ({
          type: 'palette' as const,
          id: palette.id,
          label: palette.name
        }))
    ])

    const quickReactionTab = computed(() => {
      if (!isRecommendationEnabled.value) return historyTab

      return (
        personalTabs.value.find(
          tab => getStampSetKey(tab) === settings.quickReactionSource
        ) ?? recommendationTab
      )
    })
    const quickReactionSource = computed({
      get: () => getStampSetKey(quickReactionTab.value),
      set: (key: string) => {
        settings.quickReactionSource = key
      }
    })
    const quickReactionStampIds = computed(() => {
      const tab = quickReactionTab.value

      if (tab.type === 'palette') {
        const stamps = stampPalettesMap.value.get(tab.id)?.stamps ?? []
        return stamps
          .slice(0, QUICK_REACTION_COUNT)
          .filter(id => stampsMap.value.has(id))
      }

      const ids =
        tab.type === 'recommendation'
          ? stampRecommendations.value
          : recentStampIds.value
      const topIds = ids.slice(0, QUICK_REACTION_COUNT)
      if (topIds.length === QUICK_REACTION_COUNT) return topIds

      const fallbackIds = initialRecentStamps.value.map(stamp => stamp.id)
      return [...new Set([...topIds, ...fallbackIds])].slice(
        0,
        QUICK_REACTION_COUNT
      )
    })

    return {
      isRecommendationEnabled,
      defaultTab,
      personalTabs,
      tabOrder: toRef(settings, 'tabOrder'),
      quickReactionSource,
      quickReactionStampIds
    }
  }
)

export const useStampPickerSettings = convertToRefsStore(
  useStampPickerSettingsPinia
)

if (import.meta.hot) {
  import.meta.hot.accept(
    acceptHMRUpdate(useStampPickerSettingsPinia, import.meta.hot)
  )
}
