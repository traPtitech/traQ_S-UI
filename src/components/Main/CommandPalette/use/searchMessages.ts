import { Message } from '@traptitech/traq'
import apis from '@/lib/apis'
import store from '@/store'
import { channelPathToId, ChannelTree } from '@/lib/channelTree'

type SearchMessageQuery = Parameters<typeof apis.searchMessages>
type SearchMessageResult = {
  totalHits: number
  hits: Message[]
}

/**
 * 空白で区切られた後のクエリをreduceしていくときの型
 */
type QueryWordOrFilter = {
  word?: string
  after?: string
  before?: string
  in?: string
  to?: string
  from?: string
  bot?: boolean
  hasUrl?: boolean
  hasAttachments?: boolean
  hasImage?: boolean
  hasVideo?: boolean
  hasAudio?: boolean
}

// フィルターのprefix

const afterQueryPrefixes = ['after:', 'since:']
const beforeQueryPrefixes = ['before:', 'until:']
const inQueryPrefixes = ['in:', '#']
const toQueryPrefixes = ['to:', '@']
const fromQueryPrefixes = ['from:', 'by:']
const isQueryPrefixes = ['is:']
const isNotQueryPrefixes = ['-is:']
const hasQueryPrefixes = ['has:']
const hasNoQueryPrefixes = ['-has:']

/**
 * prefixesのどれかにマッチするかを確認し、マッチした場合は残りの文字列を返す
 */
const prefixedQuery = (prefixes: string[]) => (q: string) => {
  for (const prefix of prefixes) {
    if (q.startsWith(prefix)) {
      return q.substring(prefix.length)
    }
  }
  return undefined
}

// フィルターにマッチする関数たち
// マッチしたらクエリの内容を返し、しなかったらundefined

const matchAfterQuery = prefixedQuery(afterQueryPrefixes)
const matchBeforeQuery = prefixedQuery(beforeQueryPrefixes)
const matchInQuery = (q: string, channelTree: ChannelTree) => {
  const result = prefixedQuery(inQueryPrefixes)(q)
  try {
    const channelName = result?.startsWith('#') ? result?.substring(1) : result
    return result
      ? channelPathToId(channelName?.split('/') ?? [], channelTree)
      : undefined
  } catch {
    return undefined
  }
}
const matchToQuery = (q: string) => {
  const result = prefixedQuery(toQueryPrefixes)(q)
  const userName = result?.startsWith('@') ? result?.substring(1) : result
  return userName ? store.getters.entities.userByName(userName)?.id : undefined
}
const matchFromQuery = (q: string) => {
  const result = prefixedQuery(fromQueryPrefixes)(q)
  const userName = result?.startsWith('@') ? result?.substring(1) : result
  return userName ? store.getters.entities.userByName(userName)?.id : undefined
}

// isとhasのクエリは複数要素あるのでQueriesの一部を返す

const matchIsQuery = (q: string): Partial<QueryWordOrFilter> => {
  const result = prefixedQuery(isQueryPrefixes)(q)
  const negationResult = prefixedQuery(isNotQueryPrefixes)(q)
  return {
    bot: checkBooleanQuery(result, negationResult, 'bot')
  }
}
const matchHasQuery = (q: string): Partial<QueryWordOrFilter> => {
  const result = prefixedQuery(hasQueryPrefixes)(q)
  const negationResult = prefixedQuery(hasNoQueryPrefixes)(q)
  return {
    hasUrl: checkBooleanQuery(result, negationResult, 'url'),
    hasAttachments: checkBooleanQuery(result, negationResult, 'attachments'),
    hasImage: checkBooleanQuery(result, negationResult, 'image'),
    hasVideo: checkBooleanQuery(result, negationResult, 'video'),
    hasAudio: checkBooleanQuery(result, negationResult, 'audio')
  }
}

const checkBooleanQuery = (
  result: string | undefined,
  negationResult: string | undefined,
  target: string
) =>
  result?.toLowerCase() === target?.toLowerCase()
    ? true
    : negationResult?.toLowerCase() === target?.toLowerCase()
    ? false
    : undefined

// reduce用の関数
const mergeQueries = (q1: QueryWordOrFilter, q2: QueryWordOrFilter) => ({
  word: [q1.word, q2.word].filter(v => v).join(' '),
  after: q2.after ?? q1.after,
  before: q2.before ?? q2.before,
  in: q1.in ?? q2.in,
  to: q1.to ?? q2.to,
  from: q1.from ?? q2.from,
  bot: q1.bot ?? q2.bot,
  hasUrl: q1.hasUrl ?? q2.hasUrl,
  hasAttachments: q1.hasAttachments ?? q2.hasAttachments,
  hasImage: q1.hasImage ?? q2.hasImage,
  hasVideo: q1.hasVideo ?? q2.hasImage,
  hasAudio: q1.hasAudio ?? q2.hasAudio
})

/**
 * クエリをパースし、検索ワードとフィルタに変換する
 */
const parseQuery = (query: string): SearchMessageQuery => {
  const channelTree = store.state.domain.channelTree.channelTree
  const result = query
    .split(' ')
    .filter(q => q)
    .map(q => {
      const parsed: QueryWordOrFilter = {
        word: undefined,
        after: matchAfterQuery(q),
        before: matchBeforeQuery(q),
        in: matchInQuery(q, channelTree),
        to: matchToQuery(q),
        from: matchFromQuery(q),
        ...matchHasQuery(q),
        ...matchIsQuery(q)
      }
      if (Object.values(parsed).filter(v => v).length === 0) {
        parsed.word = q
      }
      return parsed
    })
    .reduce(mergeQueries)

  return [
    result.word,
    result.after,
    result.before,
    result.in,
    result.to,
    result.from,
    undefined, // TBD
    result.bot,
    result.hasUrl,
    result.hasAttachments,
    result.hasImage,
    result.hasVideo,
    result.hasAudio
  ]
}

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
