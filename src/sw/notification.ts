import { initializeApp } from 'firebase/app'
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw'
import type { NotificationClickEvent } from '/@/types/InlineNotificationReplies'
import { createNotificationArgumentsCreator } from '/@/lib/notification/notificationArguments'
import { getMeStore } from '/@/sw/store'
import type { ChannelId } from '/@/types/entity-ids'
import { wait } from '/@/lib/basic/timer'
import type { FirebasePayloadData } from '/@/lib/notification/firebase'
import type { ServiceWorkerNavigateMessage } from '/@/lib/notification/notification'

declare const self: typeof globalThis

const postMessage = (channelId: ChannelId, text: string) =>
  fetch(`/api/v3/channels/${channelId}/messages`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ content: text, embed: true })
  })

const openChannel = async (event: NotificationClickEvent) => {
  const clientsArr = await self.clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  })
  if (clientsArr[0]) {
    const client = await clientsArr[0].focus()
    const message: ServiceWorkerNavigateMessage = {
      type: 'navigate',
      to: event.notification.data.path
    }
    return client.postMessage(message)
  } else {
    return self.clients.openWindow(event.notification.data.path)
  }
}

// refs src/lib/notification/notification.ts showNotification()
export const setupNotification = async () => {
  /*
    - workerでのdynamic importの対応状況がよくない点
    - viteでimportが解決されて別の場所をさしてしまう点
    からimportScriptsを利用する
  */
  importScripts('/config.js')

  const appName = self.traQConfig.name || 'traQ'
  const ignoredChannels = self.traQConfig.inlineReplyDisableChannels || []
  const createNotificationArguments = createNotificationArgumentsCreator(
    appName,
    ignoredChannels
  )

  const showNotification = (data: FirebasePayloadData) => {
    const [notificationTitle, notificationOptions] =
      createNotificationArguments(data)
    notificationOptions.data = data

    return self.registration
      .showNotification(notificationTitle, notificationOptions)
      .catch(err => {
        // eslint-disable-next-line no-console
        console.error('[sw] showNotification error:', err)
      })
  }

  const onReplyButtonClick = async (event: NotificationClickEvent) => {
    const data = event.notification.data
    const channelId = data.tag.slice('c:'.length)

    // https://crbug.com/1050352#c5
    // androidでしか通知の再度の発火は発生しない模様
    try {
      const [store] = await Promise.all([
        getMeStore(),
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        postMessage(channelId, event.reply!)
      ])
      event.notification.close()

      if (store?.detail) {
        const me = store.detail
        data.body = `${me.displayName}: ${event.reply}`
        data.icon = `/api/v3/files/${me.iconFileId}`
      } else {
        // eslint-disable-next-line no-console
        console.warn('[sw] no store or me.detail found')
        data.body = `自分: ${event.reply}`
        data.icon = ``
      }

      data.silent = true
      return showNotification(data)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[sw] sendReply error:', err)

      await showNotification(data)
      await wait(0)

      const notifications = await self.registration.getNotifications({
        tag: data.tag
      })
      notifications.forEach(notification => notification.close())
    }
  }

  self.addEventListener('notificationclick', _event => {
    const event = _event as NotificationClickEvent
    if (event.reply) {
      event.waitUntil(onReplyButtonClick(event))
      return
    }
    event.notification.close()

    event.waitUntil(openChannel(event))
  })

  if (self.traQConfig.firebase !== undefined) {
    const firebaseApp = initializeApp(self.traQConfig.firebase)
    const messaging = getMessaging(firebaseApp)

    onBackgroundMessage(messaging, payload => {
      const payloadData = payload.data as FirebasePayloadData | undefined
      if (payloadData && payloadData.type === 'new_message') {
        return showNotification(payloadData)
      }
    })
  }
}
