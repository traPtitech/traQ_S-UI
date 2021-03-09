import store from '@/store'
import { Channel } from '@traptitech/traq'
import { reactive, computed, Ref } from 'vue'
import { checkResult, channelDeepMatching } from '@/lib/channel'

const useChannelFilter = (targetChannels: Ref<readonly Channel[]>) => {
  const targetChannelIds = computed(
    () => new Set(targetChannels.value.map(channel => channel.id))
  )
  const oneLetterChannels = computed(() =>
    [...store.state.entities.channelsMap.values()].filter(
      channel => channel.name.length === 1
    )
  )

  const state = reactive({
    query: '',
    filteredItems: computed((): readonly Channel[] => {
      if (state.query.length === 0) {
        return targetChannels.value
      }
      const query = state.query.toLowerCase()
      const queryArr: [string, ...string[]] = state.query
        .toLowerCase()
        .split(/[\/\\]/) as [string, ...string[]] // split の返り値は空配列にはならないのでキャストできる

      const matchCheck = (channel: Channel, query: string): checkResult => {
        if (channel.name === query) return checkResult.perfect
        if (channel.name.includes(query)) return checkResult.match
        return checkResult.none
      }

      const { perfectMatched: fullMatched, matched } = channelDeepMatching(
        store.state.entities.channelsMap,
        matchCheck,
        queryArr,
        targetChannelIds.value
      )
      return query.length === 1 && queryArr.length === 1
        ? [...fullMatched] // query が真に 1 文字のときは完全一致のみ
        : [...fullMatched, ...matched]
    })
  })
  const setQuery = (query: string) => {
    state.query = query
  }
  return {
    textFilterState: state,
    setQuery
  }
}

export default useChannelFilter
