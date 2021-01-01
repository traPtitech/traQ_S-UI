import Token from 'markdown-it/lib/token'

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
  let isInLink = false
  let isInSpoiler = false
  for (const token of tokens) {
    if (token.type === 'link_close') {
      isInLink = false
      continue
    } else if (token.type === 'spoiler_close') {
      rendered.push(' ﾍﾟｹﾍﾟｹ ')
      isInSpoiler = false
      continue
    }

    if (isInLink) {
      if (token.type === 'text') {
        rendered.push(formatUrl(token.content, embeddingOrigin))
      }
      continue
    } else if (isInSpoiler) {
      continue
    }

    if (token.type === 'link_open') {
      isInLink = true
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
      rendered.push(` ${token.meta.match[1]}スタンプ `)
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
