// 実際のフィルタに依存しない関数群
import store from '@/store'
import { ChannelId, UserId, MessageId } from '@/types/entity-ids'
import { channelPathToId } from '../channelTree'

/*
 * クエリは次のようにパースされる:

 *        split          extractor                              parser
 * string ----> string[] --------> (ExtractedFilter | string)[] -----> (Filter | string)[]
 *
 * - extractor: 分割済み文字列を受け取って、ExtractedFilter(prefix・本体・メタ情報を持つ型)への変換を試みる
 *              フィルターの種別ごとに存在する (型は`FilterExtractor`)
 * - parser: ExtractedFilterとフィルターの種別を受け取り、日時やチャンネルIDなどへの変換を試みる
 *           フィルターの持つ値の型ごとに存在する (型は`FilterParser<T>`)
 * 
 * 例: `in:#general not:bot abc`
 *     -> ["in:#general", "not:bot", "abc"]
 *     -> [
 *            { prefix: "in:", body: "#general", negate: false },
 *            { "not:", "bot", true },
 *            "abc"
 *        ]
 *     -> [
 *            { type: "in", raw: "in:#general", value: "${#generalのチャンネルID}" },
 *            { type: "is", raw: "not:bot", value: "bot", negate: true },
 *            { type: "word", raw: "abc", value: "abc" },
 *        ]
 * 注: 最後の変換は実際のクエリの内容に依存するためparseQuery.tsを参照
 *     このモジュールではジェネリクスで対応している
 */

// フィルタ抽出

/**
 * 検索クエリからフィルタとして扱える文字列を抽出し、変換したものの型
 */
export type ExtractedFilter = {
  prefix: string
  body: string
  negate: boolean
}

/**
 * 文字列を`ExtractedFilter`にできるかを検査し、可能であれば変換して返しそうでなければそのまま返すような関数の型
 *
 * @param q 空白で分割された文字列
 */
export type FilterExtractor = (q: string) => ExtractedFilter | string

/** もとのクエリを復元する */
export const rawQuery = (extracted: ExtractedFilter) =>
  extracted.prefix + extracted.body

/**
 * プレフィックスからextractorを作る
 *
 * @param prefixes　プレフィックスとして認める物のリスト
 * @param prefixes　否定プレフィックス フラグ式のフィルター以外は指定する必要なし
 */
export const makePrefixedFilterExtractor = (
  prefixes: string[],
  negatePrefixes: string[] = []
) => (q: string): ExtractedFilter | string => {
  for (const prefix of prefixes) {
    if (q.startsWith(prefix)) {
      return { prefix, body: q.substring(prefix.length), negate: false }
    }
  }
  for (const prefix of negatePrefixes) {
    if (q.startsWith(prefix)) {
      return { prefix, body: q.substring(prefix.length), negate: true }
    }
  }
  return q
}

/**
 * `string`から`ExtractedFilter`を経由して実際のフィルターを作る
 * @typeParam F フィルターの型
 * @typeParam T フィルター種別の型
 * @param parser `extracted`をフィルター種別`type`とみなして変換するパーサー
 * @param filterExtractorMap フィルター種別とextractorのマップ
 * @param skipCondition チェックを飛ばす条件 ':'が含まれていない など
 * @returns
 */
export const extractFilter = <F, T extends string>(
  parser: (type: T, extracted: ExtractedFilter) => F | undefined,
  filterExtractorMap: Map<T, FilterExtractor>,
  skipCondition?: (q: string) => boolean
) => (q: string): F | string => {
  if (skipCondition?.(q)) {
    return q
  }
  for (const [type, extractor] of filterExtractorMap.entries()) {
    const extracted = extractor(q)
    if (typeof extracted === 'string') {
      continue
    }
    const parsed = parser(type, extracted)
    if (!parsed) {
      continue
    }
    return parsed
  }
  return q
}

// パーサー実装

/**
 * `ExtractedFilter.body`が型`T`を持つ値として解釈できるかを検査し、成功すればその値・失敗すれば`undefined`を返すような関数の型
 */
export type FilterParser<T> = (extracted: ExtractedFilter) => T | undefined

export const dateParser: FilterParser<Date> = extracted => {
  const date = new Date(extracted.body)
  if (isNaN(date.getTime())) {
    return undefined
  }
  return date
}

export const channelParser: FilterParser<ChannelId> = extracted => {
  const channelTree = store.state.domain.channelTree.channelTree
  const channelName = extracted.body.startsWith('#')
    ? extracted.body.substring(1)
    : extracted.body
  try {
    const channelId = channelPathToId(
      channelName?.split('/') ?? [],
      channelTree
    )
    return channelId
  } catch (e) {
    return undefined
  }
}

export const userParser: FilterParser<UserId> = extracted => {
  const userName = extracted.body.startsWith('@')
    ? extracted.body.substring(1)
    : extracted.body
  const userId = store.getters.entities.userByName(userName)?.id
  if (userId === undefined) {
    return userId
  }
  return userId
}

export const messageParser: FilterParser<MessageId> = _ => {
  // TBD
  return undefined
}
