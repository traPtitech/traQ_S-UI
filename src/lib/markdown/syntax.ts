import math from '@traptitech/markdown-it-katex'
import spoiler from '@traptitech/markdown-it-spoiler'
import type { Store } from '@traptitech/traq-markdown-it'
import json from '@traptitech/traq-markdown-it/src/json.ts'
import stamp from '@traptitech/traq-markdown-it/src/stamp.ts'

import MarkdownIt from 'markdown-it'
import mark from 'markdown-it-mark'

// traq-markdown-it 7 の構文 plugin を使い、表示用 store/highlight を読み込まない。
const syntaxStore: Store = {
  getUser: () => undefined,
  getChannel: id => ({ id }),
  getUserGroup: () => undefined,
  getMe: () => undefined,
  getStampByName: () => undefined,
  getUserByName: () => undefined,
  generateChannelHref: () => '',
  generateUserHref: () => '',
  generateUserGroupHref: () => ''
}

export const configureMarkdownDialect = (parser: MarkdownIt) => {
  parser.linkify.tlds(['app', 'dev', 'games', 'tech', 'show'], true)

  return parser
}

export const createMarkdownAnalysisParser = () =>
  configureMarkdownDialect(
    new MarkdownIt({ breaks: true, linkify: true })
      .use(mark)
      .use(spoiler, true)
      .use(json, syntaxStore)
      .use(stamp, syntaxStore)
      .use(math)
  )
