import { defineStore, acceptHMRUpdate } from 'pinia'
import { computed, ref } from 'vue'
import apis from '/@/lib/apis'
import { useStampsStore } from '/@/store/entities/stamps'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'
import { StampId } from '/@/types/entity-ids'

const useStampHistoryPinia = defineStore('domain/stampHistory', () => {
  const stampsStore = useStampsStore()

  const stampHistory = ref(new Map<StampId, Date>())
  const stampHistoryFetched = ref(false)
  const recentStampIds = computed(() =>
    [...stampHistory.value.entries()]
      .filter(([stampId]) => stampsStore.stampsMap.value.has(stampId))
      .sort((e1, e2) => {
        // 日付の降順
        if (e1[1] > e2[1]) return -1
        if (e1[1] < e2[1]) return 1
        return 0
      })
      .map(([key]) => key)
  )
  const upsertLocalStampHistory = (stampId: StampId, datetime: Date) => {
    stampHistory.value.set(stampId, datetime)
  }
  const fetchStampHistory = async ({
    ignoreCache = false
  }: { ignoreCache?: boolean } = {}) => {
    if (!ignoreCache && stampHistoryFetched.value) return

    const { data } = await apis.getMyStampHistory()
    stampHistory.value = new Map(
      data.map(h => [h.stampId, new Date(h.datetime)])
    )
    stampHistoryFetched.value = true
  }

  return {
    recentStampIds,
    upsertLocalStampHistory,
    fetchStampHistory
  }
})

export const useStampHistory = convertToRefsStore(useStampHistoryPinia)

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useStampHistoryPinia, import.meta.hot))
}
