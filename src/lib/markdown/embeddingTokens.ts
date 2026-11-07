export type EmbeddingToken = {
  start: number
  length: number
  source: string
  value: unknown
}

/** 原文を一度だけ走査する。型の検証は利用側で行う。 */
export function* embeddingTokens(text: string): Generator<EmbeddingToken> {
  let start = -1
  let depth = 0
  let quoted = false
  let escaped = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]

    if (quoted) {
      if (escaped) escaped = false
      else if (char === '\\') escaped = true
      else if (char === '"') quoted = false
      // JSON 文字列中の改行は不正。
      else if (char === '\n' || char === '\r') {
        start = -1
        quoted = false
      }

      continue
    }

    if (char === '!' && text[i + 1] === '{') {
      // 未完の埋め込みからは次のマーカーで復帰する。
      start = i++
      depth = 1
      continue
    }

    if (start < 0) continue

    if (char === '"') quoted = true
    else if (char === '{') depth++
    else if (char === '}' && --depth === 0) {
      const source = text.slice(start, i + 1)
      let value: unknown

      try {
        value = JSON.parse(source.slice(1))
      } catch {
        // 不正な埋め込みは原文を保持する。
      }

      yield { start, length: source.length, source, value }
      start = -1
    }
  }
}
