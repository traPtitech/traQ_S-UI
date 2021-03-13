import { ref } from 'vue'
import { Message } from '@traptitech/traq'
import apis from '@/lib/apis'
import store from '@/store'
import useQueryParer from '@/use/searchMessage/queryParser'

type SearchMessageResult = {
  totalHits: number
  hits: Message[]
}

const useSearchMessages = () => {
  const { parseQuery } = useQueryParer()
  const fetchingSearchResult = ref(false)
  const fetchAndRenderMessagesBySearch = async (
    query: string
  ): Promise<SearchMessageResult> => {
    if (query === '') {
      return emptyResult
    }
    fetchingSearchResult.value = true
    const res = await apis.searchMessages(...parseQuery(query))
    const hits = res.data.hits ?? []
    store.dispatch.entities.messages.extendMessagesMap(hits)
    hits.map(message =>
      store.dispatch.domain.messagesView.renderMessageContent(message.id)
    )
    fetchingSearchResult.value = false

    return {
      totalHits: res.data.totalHits ?? 0,
      hits
    }
  }
  return {
    fetchMessagesBySearch: fetchAndRenderMessagesBySearch,
    fetchingSearchResult
  }
}

export default useSearchMessages

const emptyResult = { hits: [], totalHits: 0 }
