import type { Token } from 'markdown-it'

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

export const format = (
  inputTokens: readonly Token[],
  embeddingOrigin: string
) => {
  const tokens = inputTokens.flatMap(token => {
    if (token.type === 'inline') return token.children || []
    return token
  })

  const rendered = []
  let linkHref: string | null = null
  let isInSpoiler = false
  for (const token of tokens) {
    if (token.type === 'link_close') {
      linkHref = null
      continue
    } else if (token.type === 'spoiler_close') {
      rendered.push(' ﾍﾟｹﾍﾟｹ ')
      isInSpoiler = false
      continue
    }

    if (linkHref !== null) {
      if (token.type === 'text') {
        if (linkHref === token.content) {
          rendered.push(formatUrl(token.content, embeddingOrigin))
        } else {
          rendered.push(token.content)
        }
      }
      continue
    } else if (isInSpoiler) {
      continue
    }

    if (token.type === 'link_open') {
      linkHref = token.attrGet('href') ?? ''
      continue
    } else if (token.type === 'spoiler_open') {
      isInSpoiler = true
      continue
    }

    if (token.type === 'text') {
      rendered.push(token.content)
    } else if (token.type === 'softbreak') {
      rendered.push('\n')
    } else if (token.type === 'regexp-0') {
      // stamp
      const stampName = token.meta.match[0].slice(1, -1)
      rendered.push(` ${stampName}スタンプ `)
    } else if (token.type === 'math_inline') {
      rendered.push(' 数式 ')
    } else if (token.type === 'math_block') {
      rendered.push('\n数式\n')
    } else if (token.type === 'fence') {
      rendered.push('\nコードブロック\n')
    } else if (token.type === 'code_inline') {
      rendered.push(token.content)
    }
  }
  return rendered.join('')
}
