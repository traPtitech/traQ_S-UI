import stamp from '@traptitech/traq-markdown-it/src/stamp.ts'

import MarkdownIt from 'markdown-it'

import { embeddingOrigin } from '/@/lib/apis'

import { markdownStore } from '../store'

const parser = new MarkdownIt('zero').use(stamp, markdownStore, embeddingOrigin)

export const renderStampInline = (text: string) => parser.renderInline(text)
