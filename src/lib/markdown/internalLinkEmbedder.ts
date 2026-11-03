import { encodeReference } from '../references'

// URL の一部、ユーザーアイコン記法、末尾にピリオドがある名前は置換しない。
const urlPattern =
  '(?:https?://)?(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]+(?:/[^/\\s]*)*/?'
const urlStart = new RegExp('^' + urlPattern)
const mention = new RegExp(
  '(' + urlPattern + ')?:?[@＠]([^\\s@＠.]{0,31}[^\\s@＠:.])\\.?',
  'g'
)
const userStart = /^[@＠]([a-zA-Z0-9_-]{1,32})/
const channel = new RegExp('(' + urlPattern + ')?[#＃]([a-zA-Z0-9_/-]+)', 'g')

export type InternalLinkGetters = {
  userId: (name: string) => string | undefined
  groupId: (name: string) => string | undefined
  channelId: (path: string) => string | undefined
}

const encode = (type: 'user' | 'group' | 'channel', raw: string, id: string) =>
  encodeReference({ type, raw, id })

/** コードや既存の埋め込みを除いた原文に、従来の名前解決を適用する。 */
export const embedInternalLinks = (
  source: string,
  getters: InternalLinkGetters
) =>
  source
    .replace(channel, raw => {
      if (urlStart.test(raw)) return raw

      const id = getters.channelId(raw.slice(1))
      return id ? encode('channel', raw, id) : raw
    })
    .replace(mention, raw => {
      if (urlStart.test(raw) || raw.startsWith(':') || raw.endsWith('.'))
        return raw

      const name = raw.slice(1)
      const userId = getters.userId(name)
      if (userId) return encode('user', raw, userId)

      const groupId = getters.groupId(name)
      if (groupId) return encode('group', raw, groupId)

      return raw.replace(userStart, (prefix: string, name: string) => {
        const id = getters.userId(name)
        return id ? encode('user', prefix, id) : prefix
      })
    })
