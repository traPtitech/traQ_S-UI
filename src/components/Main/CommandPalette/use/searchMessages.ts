import { Message } from '@traptitech/traq'
import apis from '@/lib/apis'
import store from '@/store'

type SearchMessageQuery = Parameters<typeof apis.searchMessages>
type SearchMessageResult = {
  totalHits: number
  hits: Message[]
}

const parseQuery = (query: string): SearchMessageQuery => [query]

const useSearchMessages = () => {
  const fetchMessagesBySearch = async (
    query: string
  ): Promise<SearchMessageResult> => {
    if (query === '') {
      return emptyResult
    }
    const res = await apis.searchMessages(...parseQuery(query))
    const hits = res.data.hits ?? []
    store.dispatch.entities.messages.extendMessagesMap(hits)

    return {
      totalHits: res.data.totalHits ?? 0,
      hits
    }
  }
  return { fetchMessagesBySearch }
}

export default useSearchMessages

const emptyResult = { hits: [], totalHits: 0 }
