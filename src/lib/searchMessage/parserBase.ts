// 実際のフィルタに依存しない関数群
import type { ChannelId, MessageId, UserId } from '/@/types/entity-ids'

const dateOnlyFormRegex = /^[0-9]{4}(-[0-9]{2}(-[0-9]{2})?)?$/

/*
 * クエリは次のようにパースされる:
 *
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
 * 注: 最後の変換は実際のクエリの内容に依存するためqueryParser.tsを参照
 *     このモジュールではジェネリクスで対応している
 */

// フィルタ抽出

/**
 * 検索クエリからフィルタとして扱える文字列を抽出し、変換したものの型
 */
export type ExtractedFilter<T extends string> = {
  type: T
  prefix: string
  body: string
  negate: boolean
}

/**
 * 文字列を`ExtractedFilter`にできるかを検査し、可能であれば変換して返しそうでなければそのまま返すような関数の型
 *
 * @param q 空白で分割された文字列
 */
export type FilterExtractor<T extends string> = (
  q: string
) => ExtractedFilter<T> | string

/** もとのクエリを復元する */
export const rawQuery = <T extends string>(extracted: ExtractedFilter<T>) =>
  extracted.prefix + extracted.body

/**
 * プレフィックスからextractorを作る
 *
 * @param prefixes プレフィックスとして認める物のリスト
 * @param prefixes 否定プレフィックス フラグ式のフィルター以外は指定する必要なし
 */
export const makePrefixedFilterExtractor =
  <T extends string>(
    type: T,
    prefixes: string[],
    negatePrefixes: string[] = []
  ) =>
  (q: string): ExtractedFilter<T> | string => {
    for (const prefix of prefixes) {
      if (q.startsWith(prefix)) {
        return { type, prefix, body: q.slice(prefix.length), negate: false }
      }
    }
    for (const prefix of negatePrefixes) {
      if (q.startsWith(prefix)) {
        return { type, prefix, body: q.slice(prefix.length), negate: true }
      }
    }
    return q
  }

export type StoreForParser = {
  channelPathToId: ChannelPathToId
  usernameToId: UsernameToId
  getCurrentChannelPath: () => string | undefined
  getMyUsername: () => string | undefined
}

type ChannelPathToId = (path: string) => ChannelId | undefined
type UsernameToId =
  | ((username: string) => UserId | undefined)
  | ((username: string) => Promise<UserId | undefined>)

/**
 * `string`から`ExtractedFilter`を経由して実際のフィルターを作る
 * @typeParam F フィルターの型
 * @typeParam T フィルター種別の型
 * @param parser `extracted`をフィルター種別`type`とみなして変換するパーサー
 * @param extractor フィルター種別とextractorのマップ
 * @param skipCondition チェックを飛ばす条件 ':'が含まれていない など
 * @returns
 */
export const parseToFilter =
  <F, T extends string>(
    parser: (
      store: StoreForParser,
      extracted: ExtractedFilter<T>
    ) => Promise<F | undefined>,
    extractor: FilterExtractor<T>,
    skipCondition?: (q: string) => boolean
  ) =>
  (store: StoreForParser) =>
  async (q: string): Promise<F | string> => {
    if (skipCondition?.(q)) {
      return q
    }
    const extracted = extractor(q)
    if (typeof extracted === 'string') {
      return q
    }
    const parsed = await parser(store, extracted)
    if (!parsed) {
      return q
    }
    return parsed
  }

// パーサー実装

/**
 * `ExtractedFilter.body`が型`V`を持つ値として解釈できるかを検査し、成功すればその値・失敗すれば`undefined`を返すような関数の型
 */
export type FilterParser<T extends string, V> = (
  extracted: ExtractedFilter<T>
) => V | undefined

export const dateParser = <T extends string>(
  extracted: ExtractedFilter<T>
): Date | undefined => {
  // date-only form から date-time form に直して地方時を指定する
  const dateQuery = dateOnlyFormRegex.test(extracted.body)
    ? extracted.body + 'T00:00:00.000'
    : extracted.body
  const date = new Date(dateQuery)
  if (Number.isNaN(date.getTime())) {
    return undefined
  }
  return date
}

export const InHereToken = Symbol('in:here')
export const FromToMeToken = Symbol('from:me / to:me')

export const channelParser = <T extends string>(
  channelPathToId: ChannelPathToId,
  extracted: ExtractedFilter<T>
): ChannelId | typeof InHereToken | undefined => {
  if (extracted.body === 'here') {
    return InHereToken
  }

  const channelName = extracted.body.startsWith('#')
    ? extracted.body.slice(1)
    : extracted.body
  return channelPathToId(channelName)
}

export const userParser = async <T extends string>(
  usernameToId: UsernameToId,
  extracted: ExtractedFilter<T>
): Promise<UserId | typeof FromToMeToken | undefined> => {
  const username = extracted.body.startsWith('@')
    ? extracted.body.slice(1)
    : extracted.body

  if (username === 'me') {
    return FromToMeToken
  }

  return usernameToId(username)
}

export const messageParser = <T extends string>(
  extracted: ExtractedFilter<T>
): MessageId | undefined => {
  try {
    const url = new URL(extracted.body)
    const pathNames = url.pathname.split('/')
    if (pathNames.length === 3 && pathNames[1] === 'messages') {
      return pathNames[2]
    }
    return undefined
  } catch {
    // URLではなかった場合、メッセージIDとして解釈
    return extracted.body
  }
}
