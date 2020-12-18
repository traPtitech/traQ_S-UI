import { StampId } from '@/types/entity-ids'
import { Stamp } from '@traptitech/traq'
import { compareStringInsensitive } from '@/lib/util/string'
import { isDefined } from '@/lib/util/array'

type StampName = string

/**
 * traQの全スタンプを分割するカテゴリ
 *
 * 表示上の分類であり、サーバー側に属性があるわけではない点に注意
 */
export type StampCategory = {
  /** カテゴリ名 */
  name: string

  /** スタンプIDのリスト(表示順) */
  stampIds: StampId[]
}

/**
 * スタンプを名前→IDのマップに変換する
 * @param stampEntities スタンプのエンティティ
 */
export const constructStampNameIdMap = (stampEntities: Map<StampId, Stamp>) => {
  /** Unicodeスタンプの名前→IDマップ */
  const unicodeStampMap: Record<StampName, StampId> = {}

  /** traQスタンプのIDリスト */
  const traQStampMap: Record<StampName, StampId> = {}
  ;[...stampEntities.values()].forEach(stamp => {
    if (stamp.isUnicode) {
      unicodeStampMap[stamp.name] = stamp.id
    } else {
      traQStampMap[stamp.name] = stamp.id
    }
  })
  return { unicodeStampMap, traQStampMap }
}

/**
 * Unicodeスタンプをunicode_emojisに従い分類する
 * @param unicodeStampMap Unicodeスタンプ名→IDのマップ
 */
export const categorizeUnicodeStamps = async (
  unicodeStampNameIdMap: Record<StampName, StampId>
) => {
  const unicodeEmojis = (await import('@/assets/unicode_emojis.json')).default

  const numCategories = unicodeEmojis.length
  const unicodeStampCategories = new Array(numCategories) as StampCategory[]

  unicodeEmojis.forEach((emojiCategory, i) => {
    const name = emojiCategory.category
    const stampIds = emojiCategory.emojis
      .map(emojiName => unicodeStampNameIdMap[emojiName])
      .filter(isDefined)
    unicodeStampCategories[i] = { name, stampIds }
  })
  return unicodeStampCategories
}

/**
 * traQスタンプをunicodeと同等のカテゴリに変換する
 * @param traQStampMap traQスタンプ名→IDのマップ
 */
export const traQStampsToStampCategory = (
  traQStampNameIdMap: Record<StampName, StampId>
): StampCategory => {
  const stampIds = Object.entries(traQStampNameIdMap)
    .sort(([name1], [name2]) => compareStringInsensitive(name1, name2))
    .map(([, value]) => value)

  return { name: 'traq', stampIds }
}
