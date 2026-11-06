import type { Channel, User, UserGroup } from '@traptitech/traq'

const timestamp = '2026-01-01T00:00:00Z'

export const createChannel = (overrides: Partial<Channel> = {}): Channel => ({
  id: 'channel-id',
  name: 'general',
  parentId: null,
  children: [],
  archived: false,
  force: false,
  topic: '',
  ...overrides
})

export const createUser = (overrides: Partial<User> = {}): User => ({
  id: 'user-id',
  name: 'alice',
  displayName: 'Alice',
  state: 1,
  bot: false,
  iconFileId: 'icon-id',
  updatedAt: timestamp,
  ...overrides
})

export const createUserGroup = (
  overrides: Partial<UserGroup> = {}
): UserGroup => ({
  id: 'group-id',
  name: 'team',
  description: '',
  type: '',
  icon: '',
  members: [],
  admins: [],
  createdAt: timestamp,
  updatedAt: timestamp,
  ...overrides
})
