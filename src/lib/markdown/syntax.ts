import spoiler from '@traptitech/markdown-it-spoiler'

import MarkdownIt from 'markdown-it'
import mark from 'markdown-it-mark'

import { mathSyntax } from './compatibility/mathSyntax'
import { traqSyntax } from './compatibility/traqSyntax'

export const configureMarkdownDialect = (parser: MarkdownIt) => {
  parser.linkify.tlds(['app', 'dev', 'games', 'tech', 'show'], true)

  return parser
}

export const createMarkdownAnalysisParser = () =>
  configureMarkdownDialect(
    new MarkdownIt({ breaks: true, linkify: true })
      .use(mark)
      .use(spoiler, true)
      .use(traqSyntax)
      .use(mathSyntax)
  )
