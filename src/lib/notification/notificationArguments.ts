import { ExtendedNotificationOptions } from '/@/types/InlineNotificationReplies'

export const createNotificationArgumentsCreator = (
  appName: string,
  ignoredChannels: string[]
) => {
  return (
    title: string | undefined,
    options: ExtendedNotificationOptions,
    withoutInput = false
  ): [string, ExtendedNotificationOptions] => {
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
