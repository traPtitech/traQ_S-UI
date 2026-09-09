import type { Document, Node } from '@traq-markdown-parser/traq'
import { names } from '@traq-markdown-parser/traq/nodes'

export const formatUrl = (text: string, embeddingOrigin: string) => {
  try {
    const url = new URL(text)
    if (url.origin === embeddingOrigin) {
      if (url.pathname.startsWith('/messages/')) {
        return ' 添付メッセージ '
      } else if (url.pathname.startsWith('/files/')) {
        return ' 添付ファイル '
      }
    }
    return `${url.hostname}ドメインのURL`
  } catch {}

  if (!text.includes('://')) {
    text = `https://${text}`
  }
  try {
    const url = new URL(text)
    return `${url.hostname}ドメインのURL`
  } catch {
    return `不明なドメインのURL`
  }
}

export const format = (document: Document, embeddingOrigin: string) => {
  const render = (node: Node): string => {
    switch (node.kind) {
      case names.Text:
        return node.data.value
      case names.Reference:
        return node.data.label
      case names.InlineCode:
        return node.data.literal
      case names.Softbreak:
        return '\n'
      case names.Spoiler:
        return ' ﾍﾟｹﾍﾟｹ '
      case names.Stamp:
        return ' ' + node.data.literal.slice(1, -1) + 'スタンプ '
      case names.InlineMath:
        return ' 数式 '
      case names.BlockMath:
        return '\n数式\n'
      case names.CodeBlock:
        return node.data.fenced ? '\nコードブロック\n' : ''
      case names.Image:
        return ''
      case names.Link:
        return node.data.form === 'explicit'
          ? (node.children ?? []).map(render).join('')
          : formatUrl(node.data.destination, embeddingOrigin)
      default:
        return (node.children ?? []).map(render).join('')
    }
  }
  return document.children.map(render).join('')
}
