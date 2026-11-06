import type { Store } from '@traptitech/traq-markdown-it'
import json from '@traptitech/traq-markdown-it/src/json.ts'
import regexp from '@traptitech/traq-markdown-it/src/regexpPlugin.ts'

import type MarkdownIt from 'markdown-it'

// src の JSON plugin は dist の描画用 plugin と store を共有しない。
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

const stampPattern =
  /:(?:[a-zA-Z0-9+_-]{1,32}|@(?:Webhook#)?[a-zA-Z0-9_-]+|\w+\([^:<>"'=+!?]+\))(?:\.[\w+-.]+)?:/

export const traqSyntax = (parser: MarkdownIt) => {
  parser.use(json, syntaxStore)
  parser.use(regexp(stampPattern, match => match[0] ?? ''))
}
