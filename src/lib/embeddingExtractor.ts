import { embeddingOrigin } from '@/lib/apis'
import { FileId, MessageId } from '@/types/entity-ids'

export type EmbeddingType = 'file' | 'message'

export type Embedding = EmbeddingFile | EmbeddingMessage

export type EmbeddingFile = {
  type: 'file'
  id: FileId
  startIndex: number
  endIndex: number
}

export type EmbeddingMessage = {
  type: 'message'
  id: MessageId
  startIndex: number
  endIndex: number
}

type EmbeddingsExtractedMessage = {
  rawText: string
  text: string
  embeddings: Embedding[]
}

const defaultRegexp = RegExp(
  `${embeddingOrigin}/(files|messages)/([\\da-f]{8}-[\\da-f]{4}-[\\da-f]{4}-[\\da-f]{4}-[\\da-f]{12})(\\s*)`,
  'g'
)

/**
 * markdownから埋め込みURLを抽出する
 *
 * @param regexp
 * マッチに使う正規表現。グループは順に
 *
 * - 種別
 * - UUID
 * - 削除されるスペース
 *
 * であることを期待する
 */
export const embeddingExtractor = (
  rawMessage: string,
  regexp = defaultRegexp
): EmbeddingsExtractedMessage => {
  const embeddings: Embedding[] = []
  const knownIdSet: Set<FileId> = new Set()

  const matches = rawMessage.matchAll(regexp)

  /** 連続したマッチの開始インデックス */
  let sequenceStartIndex = 0

  /** スペースを含んだ、連続したマッチ全体の終了インデックス */
  let sequenceEndIndex = 0

  for (const match of matches) {
    const matchIndex = match.index ?? 0
    const matchLength = match[0]?.length ?? 0
    const spaceLength = match[3]?.length ?? 0

    const type = match[1] ?? ''
    const id = match[2] ?? ''

    const startIndex = matchIndex
    const endIndex = matchIndex + matchLength - spaceLength

    if (!knownIdSet.has(id)) {
      if (type === 'files') {
        embeddings.push({ type: 'file', id, startIndex, endIndex })
      }
      if (type === 'messages') {
        embeddings.push({ type: 'message', id, startIndex, endIndex })
      }
      knownIdSet.add(id)
    }

    if (startIndex !== sequenceEndIndex) {
      // 連続したマッチではなかった
      sequenceStartIndex = startIndex
    }
    sequenceEndIndex = matchIndex + matchLength
  }

  const hasSequenceReachedEos = sequenceEndIndex === rawMessage.length

  return {
    rawText: rawMessage,
    text: hasSequenceReachedEos
      ? rawMessage.substring(0, sequenceStartIndex)
      : rawMessage,
    embeddings
  }
}
