/**
 * SafariでrequestPermissionがPromiseを返してくれないためのpolyfill
 * なお、iOS SafariではそもそもNotificationが存在しないため、呼び出さないようにすること
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Notification/requestPermission
 */
export const requestNotificationPermission =
  (): Promise<NotificationPermission> =>
    new Promise(resolve => {
      Notification.requestPermission(result => {
        resolve(result)
      })
    })
