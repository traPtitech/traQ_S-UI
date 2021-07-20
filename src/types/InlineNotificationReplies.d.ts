interface ExtendedNotificationAction extends NotificationAction {
  type?: 'text' | 'button'
  placeholder?: string
}
export interface ExtendedNotificationOptions extends NotificationOptions {
  actions?: ExtendedNotificationAction[]
}

export interface NotificationClickEvent extends NotificationEvent {
  reply?: string
}
