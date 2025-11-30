import { computed, ref } from 'vue'

import { acceptHMRUpdate, defineStore } from 'pinia'

import apis from '/@/lib/apis'
import { useStampsStore } from '/@/store/entities/stamps'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'
import type { StampId } from '/@/types/entity-ids'

const useStampRecommendationsPinia = defineStore(
  'domain/stampRecommendations',
  () => {
    const stampsStore = useStampsStore()

    const stampToRecommendationScore = ref(new Map<StampId, number>())
    const stampRecommendationsFetched = ref(false)

    const stampRecommendations = computed(() =>
      [...stampToRecommendationScore.value.keys()]
        .filter(stampId => stampsStore.stampsMap.value.has(stampId))
        .sort((stampId1, stampId2) => {
          const score1 = stampToRecommendationScore.value.get(stampId1) ?? 0
          const score2 = stampToRecommendationScore.value.get(stampId2) ?? 0
          return score2 - score1
        })
    )

    const recentlyRecorded = new Set<StampId>()
    const recordStampUsage = (stampId: StampId) => {
      if (recentlyRecorded.has(stampId)) return
      recentlyRecorded.add(stampId)
      setTimeout(() => {
        recentlyRecorded.delete(stampId)
      }, 50)

      stampToRecommendationScore.value.set(
        stampId,
        (stampToRecommendationScore.value.get(stampId) || 0) + 1
      )
    }

    const fetchStampRecommendations = async ({
      ignoreCache = false
    }: { ignoreCache?: boolean } = {}) => {
      if (!ignoreCache && stampRecommendationsFetched.value) return

      await apis.getMyStampRecommendations().then(res => {
        stampToRecommendationScore.value = new Map(
          res.data.map(h => [h.stampId, h.score])
        )
      })
      stampRecommendationsFetched.value = true
    }

    return {
      stampRecommendations,
      recordStampUsage,
      fetchStampRecommendations
    }
  }
)

export const useStampRecommendations = convertToRefsStore(
  useStampRecommendationsPinia
)

if (import.meta.hot) {
  import.meta.hot.accept(
    acceptHMRUpdate(useStampRecommendationsPinia, import.meta.hot)
  )
}
