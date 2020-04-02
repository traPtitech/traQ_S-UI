import 'core-js/features/string/virtual/match-all'
import { filePathOrigin } from '@/lib/api'
import { FileId } from '@/types/entity-ids'

export type EmbeddedFile = {
  id: FileId

  /** 埋め込みの開始インデックス */
  startIndex: number

  /** 埋め込みの終了インデックス */
  endIndex: number
}

type EmbeddedFilesExtractedMessage = {
  rawText: string
  text: string
  embeddings: EmbeddedFile[]
}

const defaultFileBasePath = `${filePathOrigin}/files`
const defaultRegexp = RegExp(
  `${defaultFileBasePath}/([\\da-f]{8}-[\\da-f]{4}-[\\da-f]{4}-[\\da-f]{4}-[\\da-f]{12})(\\s*)`,
  'g'
)

/** markdownから埋め込みファイルURLを抽出する */
export const embeddingExtractor = (
  rawMessage: string,
  regexp = defaultRegexp
): EmbeddedFilesExtractedMessage => {
  const embeddings: EmbeddedFile[] = []

  const matches = rawMessage.matchAll(regexp)

  /** 連続したマッチの開始インデックス */
  let sequenceStartIndex = 0

  /** スペースを含んだ、連続したマッチ全体の終了インデックス */
  let sequenceEndIndex = 0

  for (const match of matches) {
    const matchIndex = match.index ?? 0
    const matchLength = match[0]?.length ?? 0
    const spaceLength = match[2]?.length ?? 0

    const id = match[1] ?? ''
    const startIndex = matchIndex
    const endIndex = matchIndex + matchLength - spaceLength
    embeddings.push({ id, startIndex, endIndex })

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
