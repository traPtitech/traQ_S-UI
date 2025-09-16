/**
 * Web notification inline replies
 * @see https://chromestatus.com/feature/5743740178137088
 * @see https://github.com/whatwg/notifications/issues/68
 * @see https://github.com/whatwg/notifications/pull/132
 */

interface NotificationAction {
  action: string
  title: string
  icon?: string
}

interface ExtendedNotificationAction extends NotificationAction {
  type?: 'text' | 'button'
  placeholder?: string
}
export interface ExtendedNotificationOptions extends NotificationOptions {
  actions?: ExtendedNotificationAction[]
  renotify?: boolean
}

export interface NotificationClickEvent extends NotificationEvent {
  reply?: string
}
