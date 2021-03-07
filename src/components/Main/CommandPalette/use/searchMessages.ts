import { Message } from '@traptitech/traq'
import apis from '@/lib/apis'
import store from '@/store'
import { channelPathToId } from '@/lib/channelTree'
import { ref } from 'vue'

type SearchMessageQuery = Parameters<typeof apis.searchMessages>
type SearchMessageResult = {
  totalHits: number
  hits: Message[]
}

/**
 * 値を持つフィルタ
 */
type ValueFilter = {
  after?: string
  before?: string
  in?: string
  to?: string
  from?: string
  citation?: string
}

/**
 * フラグとして用いるフィルタ
 */
type FlagFilter = {
  bot?: boolean
  hasUrl?: boolean
  hasAttachments?: boolean
  hasImage?: boolean
  hasVideo?: boolean
  hasAudio?: boolean
}

/**
 * 空白で分割された後のクエリ
 */
type QueryWordOrFilter = {
  word?: string
} & ValueFilter &
  FlagFilter

// フィルターのprefix
const afterFilterPrefixes = ['after:', 'since:']
const beforeFilterPrefixes = ['before:', 'until:']
const inFilterPrefixes = ['in:', '#']
const toFilterPrefixes = ['to:', '@']
const fromFilterPrefixes = ['from:', 'by:']
const citationFilterPrefixes = ['citation:']
const isFilterPrefixes = ['is:']
const isFilterNegatePrefixes = ['-is:', 'not:']
const hasFilterPrefixes = ['has:']
const hasFilterNegatePrefixes = ['-has:']

/**
 * ValueFilterにマッチするかをテストする関数の型
 */
type ValueFilterMatcher = (q: string) => string | undefined

/**
 * prefixesのどれかにマッチするかを確認し、マッチした場合は残りの文字列を返す
 */
const prefixedQuery = (prefixes: string[]): ValueFilterMatcher => (
  q: string
) => {
  for (const prefix of prefixes) {
    if (q.startsWith(prefix)) {
      return q.substring(prefix.length)
    }
  }
  return undefined
}

/**
 * flag filterから抽出したフィルターの内容がtargetと一致するかを検査し、一致した場合は肯定か否定かを返す
 * @param result 肯定の内容 (例: `not:bot` -> undefined, `has:attachments` -> "attachments")
 * @param negationResult 否定の内容 (例: `not:bot` -> "bot", `has:attachments` -> undefined)
 * @param target 検査したいフィルタ項目
 */
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

/**
 * 値を指定するフィルターかを判定する
 */
const valueFilterMatcherMap: Map<
  keyof ValueFilter,
  ValueFilterMatcher
> = new Map([
  ['after', prefixedQuery(afterFilterPrefixes)],
  ['before', prefixedQuery(beforeFilterPrefixes)],
  [
    'in',
    q => {
      const channelTree = store.state.domain.channelTree.channelTree
      const result = prefixedQuery(inFilterPrefixes)(q)
      try {
        const channelName = result?.startsWith('#')
          ? result?.substring(1)
          : result
        return result
          ? channelPathToId(channelName?.split('/') ?? [], channelTree)
          : undefined
      } catch {
        return undefined
      }
    }
  ],
  [
    'to',
    q => {
      const result = prefixedQuery(toFilterPrefixes)(q)
      const userName = result?.startsWith('@') ? result?.substring(1) : result
      return userName
        ? store.getters.entities.userByName(userName)?.id
        : undefined
    }
  ],
  [
    'from',
    q => {
      const result = prefixedQuery(fromFilterPrefixes)(q)
      const userName = result?.startsWith('@') ? result?.substring(1) : result
      return userName
        ? store.getters.entities.userByName(userName)?.id
        : undefined
    }
  ],
  ['citation', prefixedQuery(citationFilterPrefixes)]
])

/**
 * フラグで指定するフィルターかを判定する
 */
const matchFlagFilter = (q: string) => {
  const isFilterResult = prefixedQuery(isFilterPrefixes)(q)
  const isFilterNegationResult = prefixedQuery(isFilterNegatePrefixes)(q)
  const bot = checkBooleanQuery(isFilterResult, isFilterNegationResult, 'bot')
  if (bot !== undefined) {
    return { bot }
  }

  const result = prefixedQuery(hasFilterPrefixes)(q)
  const negationResult = prefixedQuery(hasFilterNegatePrefixes)(q)
  return {
    hasUrl: checkBooleanQuery(result, negationResult, 'url'),
    hasAttachments: checkBooleanQuery(result, negationResult, 'attachments'),
    hasImage: checkBooleanQuery(result, negationResult, 'image'),
    hasVideo: checkBooleanQuery(result, negationResult, 'video'),
    hasAudio: checkBooleanQuery(result, negationResult, 'audio')
  }
}

/**
 * 分割済みクエリをマージする
 */
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

const parseSplitQuery = (q: string): QueryWordOrFilter => {
  // value filterを試す
  for (const [key, matcher] of valueFilterMatcherMap) {
    const result = matcher(q)
    if (result) {
      return { [key]: result }
    }
  }
  // frag filterを試す
  return matchFlagFilter(q)
}

/**
 * クエリをパースし、検索ワードとフィルタに変換する
 */
const parseQuery = (query: string): SearchMessageQuery => {
  const result = query
    .split(' ')
    .filter(q => q)
    .map(q => {
      const parsed: QueryWordOrFilter = parseSplitQuery(q)
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
    result.citation,
    result.bot,
    result.hasUrl,
    result.hasAttachments,
    result.hasImage,
    result.hasVideo,
    result.hasAudio,
    undefined,
    undefined
  ]
}

const useSearchMessages = () => {
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
