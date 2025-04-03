// APIに投げる検索クエリに対する実装
import type apis from '/@/lib/apis'
import type { ChannelId, MessageId, UserId } from '/@/types/entity-ids'
import type {
  ExtractedFilter,
  FilterExtractor,
  FilterParser,
  StoreForParser
} from './parserBase'
import { FromToMeToken } from './parserBase'
import {
  channelParser,
  InHereToken,
  dateParser,
  parseToFilter as parseToFilterBase,
  makePrefixedFilterExtractor,
  messageParser,
  rawQuery,
  userParser
} from './parserBase'

/** APIに投げる型 */
export type SearchMessageQuery = Parameters<typeof apis.searchMessages>

/** ソートのキー */
export type SearchMessageSortKey = SearchMessageQuery[15]

/** APIに投げる型のオブジェクト版 */
export type SearchMessageQueryObject = {
  word?: string
  after?: string
  before?: string
  in?: string
  to?: Array<string>
  from?: Array<string>
  citation?: string
  bot?: boolean
  hasUrl?: boolean
  hasAttachments?: boolean
  hasImage?: boolean
  hasVideo?: boolean
  hasAudio?: boolean
}

/** is:系のフィルターで使う */
type AttrFlagFilterKey = 'bot'

/** has:系のフィルターで使う */
type MediaFlagFilterKey = 'attachments' | 'image' | 'audio' | 'video'

/** フィルターの実装 */
export type Filter =
  | { type: 'after'; raw: string; value: Date }
  | { type: 'before'; raw: string; value: Date }
  | { type: 'in'; raw: string; value: typeof InHereToken | ChannelId }
  | { type: 'to'; raw: string; value: typeof FromToMeToken | UserId }
  | { type: 'from'; raw: string; value: typeof FromToMeToken | UserId }
  | { type: 'citation'; raw: string; value: MessageId }
  | { type: 'attrFlag'; raw: string; value: AttrFlagFilterKey; negate: boolean }
  | {
      type: 'mediaFlag'
      raw: string
      value: MediaFlagFilterKey
      negate: boolean
    }
export type FilterType = Filter['type']

/** フィルターを得るためのextractor */
const filterExtractors: FilterExtractor<FilterType>[] = [
  makePrefixedFilterExtractor('after', ['after:', 'since:']),
  makePrefixedFilterExtractor('before', ['before:', 'until:']),
  makePrefixedFilterExtractor('in', ['in:', '#']),
  makePrefixedFilterExtractor('to', ['to:', '@']),
  makePrefixedFilterExtractor('from', ['from:', 'by:']),
  makePrefixedFilterExtractor('citation', ['citation:', 'cite:']),
  makePrefixedFilterExtractor('attrFlag', ['is:'], ['-is:', 'not:']),
  makePrefixedFilterExtractor('mediaFlag', ['has:'], ['-has:'])
]

/** extractorの実装 */
const extractor: FilterExtractor<FilterType> = q => {
  for (const extractor of filterExtractors) {
    const result = extractor(q)
    if (typeof result === 'string') {
      continue
    }
    return result
  }
  return q
}

// フィルタの内容に依存しているparser

const attrFlagParser: FilterParser<
  FilterType,
  AttrFlagFilterKey
> = extracted => {
  switch (extracted.body) {
    case 'bot':
      return extracted.body
    default:
      return undefined
  }
}

const mediaFlagParser: FilterParser<
  FilterType,
  MediaFlagFilterKey
> = extracted => {
  switch (extracted.body) {
    case 'attachments':
    case 'image':
    case 'video':
    case 'audio':
      return extracted.body
    default:
      return undefined
  }
}

// parserの実装

const parser = async (
  store: StoreForParser,
  extracted: ExtractedFilter<FilterType>
): Promise<Filter | undefined> => {
  const type = extracted.type
  switch (type) {
    case 'after':
    case 'before': {
      const result = dateParser(extracted)
      return result
        ? { type, raw: rawQuery(extracted), value: result }
        : undefined
    }
    case 'in': {
      const result = channelParser(store.channelPathToId, extracted)
      return result
        ? { type, raw: rawQuery(extracted), value: result }
        : undefined
    }
    case 'to':
    case 'from': {
      const result = await userParser(store.usernameToId, extracted)
      return result
        ? { type, raw: rawQuery(extracted), value: result }
        : undefined
    }
    case 'citation': {
      const result = messageParser(extracted)
      return result
        ? { type, raw: rawQuery(extracted), value: result }
        : undefined
    }
    case 'attrFlag': {
      const result = attrFlagParser(extracted)
      return result
        ? {
            type,
            raw: rawQuery(extracted),
            value: result,
            negate: extracted.negate
          }
        : undefined
    }
    case 'mediaFlag': {
      const result = mediaFlagParser(extracted)
      return result
        ? {
            type,
            raw: rawQuery(extracted),
            value: result,
            negate: extracted.negate
          }
        : undefined
    }
  }
}

/** extractorとparserをまとめて実装を注入したもの */
const parseQueryFragmentToFilterWithoutStore = parseToFilterBase(
  parser,
  extractor,
  q => !q.includes(':') && !q.startsWith('#') && !q.startsWith('@')
)

/** 実際のクエリに対応するオブジェクトへの変換 */
const filterOrStringToSearchMessageQuery = (
  currentChannelId: string | undefined,
  myUserId: string | undefined,
  f: Filter | string
): SearchMessageQueryObject => {
  if (typeof f === 'string') {
    return { word: f }
  }

  switch (f.type) {
    case 'after':
    case 'before':
      return {
        [f.type]: f.value.toISOString()
      }
    case 'in': {
      const channelId = f.value === InHereToken ? currentChannelId : f.value
      return { in: channelId }
    }
    case 'to':
    case 'from': {
      const user = f.value === FromToMeToken ? myUserId : f.value
      return { [f.type]: user }
    }
    case 'citation':
      return { [f.type]: f.value }
    case 'attrFlag':
      return { [f.value]: !f.negate }
    case 'mediaFlag':
      return {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        [`has${f.value[0]!.toUpperCase() + f.value.slice(1)}`]: !f.negate
      }
  }
}

/**
 * クエリをパースし、検索ワードとフィルタに変換する
 */
export const createQueryParser = (store: StoreForParser) => {
  const parseQueryFragmentToFilter =
    parseQueryFragmentToFilterWithoutStore(store)

  return async (
    query: string
  ): Promise<{
    normalizedQuery: string
    queryObject: SearchMessageQueryObject
  }> => {
    const parseds = await Promise.all(
      query
        .split(' ')
        .filter(q => q)
        .map(parseQueryFragmentToFilter)
    )

    const currentChannelPath = store.getCurrentChannelPath()
    const currentChannelId = currentChannelPath
      ? store.channelPathToId(currentChannelPath)
      : undefined
    const myUsername = store.getMyUsername()
    const myUserId = myUsername
      ? await store.usernameToId(myUsername)
      : undefined

    const normalizedQuery = parseds
      .map(q =>
        parsedFilterToNormalizedString(q, currentChannelPath, myUsername)
      )
      .join(' ')
    const queryObject = parseds
      .map(f =>
        filterOrStringToSearchMessageQuery(currentChannelId, myUserId, f)
      )
      .reduce(mergeSearchMessageQueryObject, emptySearchMessageQueryObject)

    return { normalizedQuery, queryObject }
  }
}

const parsedFilterToNormalizedString = (
  f: string | Filter,
  currentChannelPath: string | undefined,
  myUsername: string | undefined
) => {
  if (typeof f === 'string') {
    return f
  }
  if (f.type === 'in' && f.value === InHereToken) {
    return `in:${currentChannelPath}`
  }
  if ((f.type === 'from' || f.type === 'to') && f.value === FromToMeToken) {
    return `${f.type}:${myUsername}`
  }
  return f.raw
}

// util

export const toSearchMessageParam = (
  obj: SearchMessageQueryObject,
  options?: Partial<{
    limit: number
    offset: number
    sort: SearchMessageSortKey
  }>
): SearchMessageQuery => [
  obj.word,
  obj.after,
  obj.before,
  obj.in,
  obj.to,
  obj.from,
  obj.citation,
  obj.bot,
  obj.hasUrl,
  obj.hasAttachments,
  obj.hasImage,
  obj.hasVideo,
  obj.hasAudio,
  options?.limit,
  options?.offset,
  options?.sort
]

const emptySearchMessageQueryObject: SearchMessageQueryObject = {
  word: undefined,
  after: undefined,
  before: undefined,
  in: undefined,
  to: undefined,
  from: undefined,
  citation: undefined,
  bot: undefined,
  hasUrl: undefined,
  hasAttachments: undefined,
  hasImage: undefined,
  hasVideo: undefined,
  hasAudio: undefined
}

const mergeSearchMessageQueryObject = (
  q1: SearchMessageQueryObject,
  q2: SearchMessageQueryObject
): SearchMessageQueryObject => ({
  word: [q1.word, q2.word].filter(v => v).join(' '),
  after: q1.after ?? q2.after,
  before: q1.before ?? q2.before,
  in: q1.in ?? q2.in,
  to: q1.to ?? q2.to,
  from: q1.from ?? q2.from,
  citation: q1.citation ?? q2.citation,
  bot: q1.bot ?? q2.bot,
  hasUrl: q1.hasUrl ?? q2.hasUrl,
  hasAttachments: q1.hasAttachments ?? q2.hasAttachments,
  hasImage: q1.hasImage ?? q2.hasImage,
  hasVideo: q1.hasVideo ?? q2.hasVideo,
  hasAudio: q1.hasAudio ?? q2.hasAudio
})
