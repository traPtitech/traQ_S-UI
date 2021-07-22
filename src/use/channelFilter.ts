import store from '/@/store'
import { Channel } from '@traptitech/traq'
import { reactive, computed, Ref } from 'vue'
import { channelDeepMatching } from '/@/lib/channel'

const useChannelFilter = (targetChannels: Ref<readonly Channel[]>) => {
  const targetChannelIds = computed(
    () => new Set(targetChannels.value.map(channel => channel.id))
  )
  const oneLetterChannels = computed(() =>
    targetChannels.value.filter(channel => channel.name.length === 1)
  )
  const rootChannels = computed(() =>
    targetChannels.value.filter(c => c.parentId === null)
  )

  const state = reactive({
    query: '',
    filteredItems: computed((): readonly Channel[] => {
      const query = state.query
      if (query.length === 0) {
        return targetChannels.value
      }

      const queryArr: [string, ...string[]] = state.query.split(/[\/\\]/) as [
        string,
        ...string[]
      ] // split の返り値は空配列にはならないのでキャストできる

      // queryが一文字のときは件数が多くなるので、少なくなるような条件にする
      if (query.length === 1) {
        // query が区切り文字のときはルート直下のチャンネル
        if (queryArr.length !== 1) {
          return rootChannels.value
        }

        // query が区切り文字でなく1文字のときは完全一致のみ
        return oneLetterChannels.value.filter(
          channel => channel.name.toLowerCase() === query.toLowerCase()
        )
      }

      const { perfectMatched: fullMatched, matched } = channelDeepMatching(
        store.state.entities.channelsMap,
        queryArr,
        targetChannelIds.value
      )
      return [...fullMatched, ...matched]
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
