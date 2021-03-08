import store from '@/store'
import { Channel } from '@traptitech/traq'
import { reactive, computed, Ref } from 'vue'

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

      /**
       * 既にマッチしたチャンネルの id をもつ
       */
      const matchedChannelIds: Set<string> = new Set()

      const fullMatched: Channel[] = []
      const matched: Channel[] = []

      /**
       *  親チャンネルから子チャンネルたちを再帰的にマッチさせていく
       */
      const recursiveMatching = (id: string) => {
        if (matchedChannelIds.has(id)) return
        matchedChannelIds.add(id)

        const channel = store.state.entities.channelsMap.get(id)
        if (channel === undefined) return
        // targetChannel に存在していたら検索結果に入れる
        if (targetChannelIds.value.has(channel.id)) {
          // 完全一致していたら fullMatched に入れる
          ;(channel.name.toLowerCase() === query ? fullMatched : matched).push(
            channel
          )
        }
        for (const child of channel.children) {
          recursiveMatching(child)
        }
      }

      /**
       *  / 区切りのクエリに対し再帰的にマッチさせていく
       */
      const recursiveMatchingWithSlash = (
        id: string,
        queryRest: [string, ...string[]] = queryArr
      ) => {
        if (matchedChannelIds.has(id)) return
        const channel = store.state.entities.channelsMap.get(id)
        if (channel === undefined) return
        if (queryRest.length === 1) {
          // 最後のひとつは前方一致
          if (!channel.name.startsWith(queryRest[0])) return
          recursiveMatching(id)
          return
        }
        // 以下 queryRest は [string, string, ...string[]] とみなせる
        if (queryRest.length === queryArr.length) {
          // 最初の一つは後方一致
          if (!channel.name.endsWith(queryRest[0])) return
        } else {
          // 間のやつは完全一致
          if (channel.name !== queryRest[0]) return
        }

        for (const child of channel.children)
          recursiveMatchingWithSlash(
            child,
            queryRest.slice(1) as [string, ...string[]] // queryRest.length > 1 なので slice しても [string, ...string[]] とみなせる
          )
      }

      // queryが区切り文字を含まない場合
      if (queryArr.length === 1) {
        if (state.query.length === 1) {
          oneLetterChannels.value
            .filter(item => item.name.toLowerCase() === query)
            .forEach(item => recursiveMatching(item.id))
          return [...fullMatched, ...matched]
        }

        for (const [id, channel] of store.state.entities.channelsMap) {
          const keyValue = channel.name.toLowerCase()
          if (keyValue.includes(query)) recursiveMatching(id)
        }
        return [...fullMatched, ...matched]
      }

      for (const id of store.state.entities.channelsMap.keys()) {
        recursiveMatchingWithSlash(id)
      }
      return [...fullMatched, ...matched] // fullMatched は 空のはずだけど一応
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
