import type { Channel, Stamp, User, UserGroup } from '@traptitech/traq'

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

export const createStamp = (overrides: Partial<Stamp> = {}): Stamp => ({
  id: 'stamp-id',
  name: 'test',
  fileId: 'icon-id',
  isUnicode: false,
  creatorId: 'user-id',
  createdAt: timestamp,
  updatedAt: timestamp,
  ...overrides
})
