import { analyzeMarkdownSource } from '../markdown/analysis'
import type { InputPart } from '../references'

/** コピーされたチャンネルリンクを、コード・数式の外側でだけ参照に変換する。 */
export const pastedChannelLinks = (
  text: string,
  options: {
    origins: readonly string[]
    channelPathToId: (path: string) => string | undefined
    before: string
    after: string
  }
): InputPart[] | undefined => {
  if (!text.includes('[#')) return

  const { origins, channelPathToId, before, after } = options
  const parts: InputPart[] = []
  let offset = 0

  // 貼り付け先の文脈も解析し、既存のコードや数式の途中では原文を保つ。
  for (const node of analyzeMarkdownSource(before + text + after).nodes) {
    if (node.kind !== 'link') continue

    const from = node.from - before.length
    const to = node.to - before.length

    if (from < offset || to > text.length) continue

    const match = /^\[(#[^\]\n]+)\]\((https?:\/\/\S+)\)$/.exec(
      text.slice(from, to)
    )

    if (!match) continue

    try {
      const url = new URL(node.href)

      if (
        !origins.includes(url.origin) ||
        url.username ||
        url.password ||
        url.search ||
        url.hash ||
        !url.pathname.startsWith('/channels/')
      )
        continue

      const path = decodeURIComponent(url.pathname.slice('/channels/'.length))
      if (match[1] !== `#${path}`) continue

      const id = channelPathToId(path)
      if (!id) continue

      if (from > offset)
        parts.push({ type: 'text', text: text.slice(offset, from) })

      parts.push({
        type: 'reference',
        reference: { type: 'channel', id, raw: `#${path}` }
      })

      offset = to
    } catch {
      // URL が不正、またはチャンネルを解決できない場合は通常のリンクとして残す。
    }
  }

  if (!parts.length) return

  if (offset < text.length)
    parts.push({ type: 'text', text: text.slice(offset) })

  return parts
}
