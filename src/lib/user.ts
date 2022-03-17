import { UserAccountState, User } from '@traptitech/traq'

export interface ActiveUser extends User {
  state: typeof UserAccountState.active
}

export const isActive = (user: Readonly<User>): user is ActiveUser =>
  user.state === UserAccountState.active

export const isWebhook = (username: string) => username.startsWith('Webhook#')
