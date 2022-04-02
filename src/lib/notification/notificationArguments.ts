import type { ExtendedNotificationOptions } from '/@/types/InlineNotificationReplies'
import type { FirebasePayloadData } from './firebase'

export const createNotificationArgumentsCreator = (
  appName: string,
  ignoredChannels: string[]
) => {
  return (
    data: Partial<FirebasePayloadData>,
    withoutInput = false
  ): [string, ExtendedNotificationOptions] => {
    const title = data.title
    const options: ExtendedNotificationOptions = {
      body: data.body,
      tag: data.tag,
      icon: data.icon,
      data: data
    }

    if (!withoutInput && title && !ignoredChannels.includes(title)) {
      const verb = title.includes('#') ? '投稿' : '返信'
      options.actions = [
        {
          action: 'reply',
          type: 'text',
          title: '返信',
          placeholder: `${title}へ${verb}する...`
        }
      ]
    }

    if (options.tag) {
      options.renotify = true
    }
    options.badge = '/img/icons/badge.png'

    return [title || appName, options]
  }
}
