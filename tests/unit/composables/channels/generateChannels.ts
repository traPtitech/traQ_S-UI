import type { Channel } from '@traptitech/traq'

/**
 * 本番環境のチャンネルツリーの分布を参考にしたチャンネル一覧を、シードから決定的に生成する
 *
 * - 深さは最大 5 (バックエンドの上限) で、3〜5 に集中する
 * - 子の数は裾が長く、子を数百持つ親が兄弟として並ぶ部分木がある
 * - 定番の名前が多くの親の下で使われ、同名のいとこが頻繁にできる
 * - 2 文字以下の名前・数字だけの名前がある
 * - 一部がアーカイブ済みで、アーカイブ済みの親の子はほとんどがアーカイブ済み
 */
export const generateChannels = ({
  seed,
  size
}: {
  seed: number
  size: number
}): Channel[] => {
  const random = createRandom(seed)
  const channels: Channel[] = []
  const depths: number[] = []
  const childNames = new Map<string | null, Set<string>>()
  // 親の抽選券。子が増えるほど券も増え、子の数の分布の裾が長くなる
  const tickets: number[] = []

  // fixedLeafName を渡すと、抽選に参加しない葉として追加する
  const addChannel = (
    parentIndex: number | null,
    fixedLeafName?: () => string
  ) => {
    const parent = parentIndex === null ? undefined : channels[parentIndex]
    const parentId = parent?.id ?? null
    const parentDepth = parentIndex === null ? 0 : (depths[parentIndex] ?? 0)
    const name = generateUniqueName(
      childNames,
      parentId,
      fixedLeafName ?? (() => generateName(random, parentDepth + 1))
    )
    const index = channels.length
    const id = String(index)
    channels.push({
      id,
      parentId,
      archived:
        random() <
        (parent?.archived ? ARCHIVE_RATE_UNDER_ARCHIVED_PARENT : ARCHIVE_RATE),
      force: false,
      topic: '',
      name,
      children: []
    })
    depths.push(parentDepth + 1)
    parent?.children.push(id)

    if (fixedLeafName !== undefined) return index
    if (parentIndex !== null) {
      pushTickets(tickets, parentIndex, parentDepth)
    }
    pushTickets(tickets, index, parentDepth + 1)
    return index
  }

  for (let i = 0; i < TOP_LEVEL_COUNT; i++) {
    addChannel(null)
  }

  // 子を数百持つ親を兄弟として並べる。いとこの走査が最も重くなる形で、
  // 抽選に任せると子が分散してこの形にならないので直接作る
  for (let i = 1; i <= 8; i++) {
    const wideParentIndex = addChannel(0)
    for (let j = 0; j < size / 5 / 2 ** i; j++) {
      // 抽選に参加させると券が集中し、ツリー全体がこの下に偏る
      addChannel(wideParentIndex, () => randomName(random))
    }
  }
  while (channels.length < size) {
    const parentIndex = tickets[Math.floor(random() * tickets.length)]
    if (parentIndex === undefined) continue
    addChannel(parentIndex)
  }

  return channels
}

const TOP_LEVEL_COUNT = 10

/**
 * 深さが 3〜5 に集中するように調整した値。
 * 深さ 5 には配らず、これが最大の深さを 5 にしている
 */
const TICKETS_BY_DEPTH: Record<number, number> = {
  1: 3,
  2: 4,
  3: 3,
  4: 2
}

const pushTickets = (tickets: number[], index: number, depth: number) =>
  tickets.push(...Array<number>(TICKETS_BY_DEPTH[depth] ?? 0).fill(index))

/** 先頭ほど頻繁に使われる */
const COMMON_NAMES = [
  'random',
  'progress',
  'general',
  'sound',
  'program',
  'graphics',
  'log',
  'chat',
  'graphic',
  'bot',
  'sub',
  'dev',
  'design',
  'memo',
  'game',
  'music',
  'news',
  'help',
  'test',
  'art'
]

const NAME_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789-_'
// 頭文字を絞り、兄弟と被りやすくする
const FIRST_CHARS = 'abcdef'
const MAX_NAME_LENGTH = 20

const generateUniqueName = (
  childNames: Map<string | null, Set<string>>,
  parentId: string | null,
  generate: () => string
) => {
  const siblings = childNames.get(parentId) ?? new Set<string>()
  childNames.set(parentId, siblings)

  // 兄弟の名前は一意 (バックエンドの制約)
  let name: string
  do {
    name = generate()
  } while (siblings.has(name))
  siblings.add(name)
  return name
}

const DIGIT_NAME_RATE = 0.1

const generateName = (random: () => number, depth: number) => {
  const commonRate = (depth - 1) * 0.15
  const r = random()
  if (r < commonRate) {
    // 先頭に偏らせる
    return COMMON_NAMES[Math.floor(random() ** 2 * COMMON_NAMES.length)] ?? ''
  }
  if (r < commonRate + DIGIT_NAME_RATE) {
    return String(Math.floor(random() * 30))
  }
  return randomName(random)
}

const randomName = (random: () => number) => {
  // 短い名前に偏らせる
  const length = 1 + Math.floor(random() ** 2 * MAX_NAME_LENGTH)

  let name = FIRST_CHARS[Math.floor(random() * FIRST_CHARS.length)] ?? 'a'
  while (name.length < length) {
    const char = NAME_CHARS[Math.floor(random() * NAME_CHARS.length)] ?? 'a'
    name += char
  }
  return name
}

const ARCHIVE_RATE = 0.1
const ARCHIVE_RATE_UNDER_ARCHIVED_PARENT = 0.9

/** シード付きの擬似乱数 (mulberry32) */
const createRandom = (seed: number) => {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
