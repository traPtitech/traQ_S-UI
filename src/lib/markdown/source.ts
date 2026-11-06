import type MarkdownIt from 'markdown-it'
import type { RuleInline } from 'markdown-it/lib/parser_inline.mjs'
import type Token from 'markdown-it/lib/token.mjs'

import { trackBlockSource } from './blockSource'
import type { SourceRange as Range } from './types'

type InlineTokenSource = { -readonly [Key in keyof Range]: Range[Key] } & {
  markerWidth?: number
}

export type PositionedToken = Token & {
  meta: {
    source?: InlineTokenSource
    match?: RegExpMatchArray
    originalPositions?: number[]
    fenceClosingLine?: number
  } | null
  position?: number
  size?: number
}

/** markdown-it 14 の State/ruler/token 契約に依存する。更新時は source・analysis の範囲/parity テストを確認する。 */
export const trackMarkdownSource = (parser: MarkdownIt) => {
  trackBlockSource(parser)
  const InlineState = parser.inline.State
  const sources = new WeakMap<Token, InlineTokenSource>()

  parser.inline.State = class extends InlineState {
    private lastPosition = -1
    private offset = 0
    private lastToken: Token | undefined

    override pushPending() {
      const token = super.pushPending()

      const from = this.src.lastIndexOf(
        token.content,
        this.pos - token.content.length
      )

      sources.set(token, { from, to: from + token.content.length })

      return token
    }

    override push(
      ...args: Parameters<InstanceType<typeof InlineState>['push']>
    ) {
      if (this.pos === this.lastPosition) {
        this.offset += this.lastToken?.content.length ?? 0
      } else {
        this.lastPosition = this.pos
        this.offset = 0
      }

      const token = super.push(...args)
      sources.set(token, { from: this.pos + this.offset, to: this.pos })
      this.lastToken = token

      return token
    }
  }

  const getRules = parser.inline.ruler.getRules.bind(parser.inline.ruler)
  const trackedRules = new WeakMap<RuleInline, RuleInline>()

  parser.inline.ruler.getRules = chain =>
    getRules(chain).map(rule => {
      let tracked = trackedRules.get(rule)

      if (!tracked) {
        tracked = (state, silent) => {
          const count = state.tokens.length
          const start = state.pos
          const matched = rule(state, silent)

          if (matched && !silent) {
            for (const token of state.tokens.slice(
              count
            ) as PositionedToken[]) {
              const source = sources.get(token)
              if (!source) continue

              if (source.to <= source.from) source.to = state.pos

              if (token.type === 'text')
                source.markerWidth = token.content.length

              if (token.tag === 'a' && token.info === 'auto') {
                const schemeLength = token.attrGet('href')?.indexOf(':') ?? 0
                source.from =
                  token.markup === 'linkify' ? start - schemeLength : start
                source.to = state.pos
              }

              // スタンプのトークンは、拡張側が保持している原文位置を使う。
              if (token.position !== undefined && token.size !== undefined) {
                source.from = token.position
                source.to = token.position + token.size
              }

              token.meta = { ...token.meta, source }
            }
          }

          return matched
        }

        trackedRules.set(rule, tracked)
      }

      return tracked
    })

  // linkify が生成したトークンを、置き換え前のテキストの位置へ対応づける。
  const beforeLinkify = new WeakMap<Token, PositionedToken[]>()

  parser.core.ruler.before('linkify', 'source_before_linkify', state => {
    for (const token of state.tokens) {
      if (token.type === 'inline' && token.children) {
        beforeLinkify.set(token, token.children as PositionedToken[])
      }
    }
  })

  parser.core.ruler.after('linkify', 'source_after_linkify', state => {
    for (const token of state.tokens) {
      const previous = beforeLinkify.get(token)
      if (!previous || !token.children) continue

      let index = 0

      for (const original of previous) {
        if (token.children[index] === original) {
          index++
          continue
        }

        const end = sources.get(original)?.to ?? 0

        const from = token.content.lastIndexOf(
          original.content,
          end - original.content.length
        )

        let offset = 0
        let link: Range | undefined

        do {
          const child = token.children[index++]
          if (!child) break

          if (child.type === 'link_open') {
            // リンクかどうかは linkify の出力で確定済み。原文での長さだけを取得する。
            const match = parser.linkify.match(
              original.content.slice(offset)
            )?.[0]

            if (!match) break

            link = { from: from + offset, to: from + offset + match.lastIndex }
            child.meta = { ...child.meta, source: link }
            offset += match.lastIndex
          } else if (child.type === 'link_close') {
            child.meta = { ...child.meta, source: link }
            link = undefined
          } else if (!link) {
            offset += child.content.length
          }
        } while (offset < original.content.length || link)
      }
    }
  })
}
