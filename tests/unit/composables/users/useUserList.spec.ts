import { createTestingPinia } from '@pinia/testing'
import type { User } from '@traptitech/traq'
import { UserAccountState } from '@traptitech/traq'
import { ref } from 'vue'
import useUserList from '/@/composables/users/useUserList'
import { useUsersStore } from '/@/store/entities/users'

describe('useUserList', () => {
  beforeEach(() => {
    createTestingPinia()

    const { usersMap } = useUsersStore()
    usersMap.value = new Map([
      ['active', userActive],
      ['inactive', userInactive],
      ['bot', userBot],
      ['webhook', userWebhook],
      ['a', userA]
    ])
  })

  it('can exclude nothing', () => {
    const filteredUserList = useUserList([])
    expect(filteredUserList.value).toStrictEqualArrayIgnoringOrder([
      userActive,
      userInactive,
      userBot,
      userWebhook,
      userA
    ])
  })
  it('can exclude inactive', () => {
    const filteredUserList = useUserList(['inactive'])
    expect(filteredUserList.value).toStrictEqualArrayIgnoringOrder([
      userActive,
      userBot,
      userWebhook,
      userA
    ])
  })
  it('can exclude bot', () => {
    const filteredUserList = useUserList(['bot'])
    expect(filteredUserList.value).toStrictEqualArrayIgnoringOrder([
      userActive,
      userInactive,
      userA
    ])
  })
  it('can exclude webhook', () => {
    const filteredUserList = useUserList(['webhook'])
    expect(filteredUserList.value).toStrictEqualArrayIgnoringOrder([
      userActive,
      userInactive,
      userBot,
      userA
    ])
  })
  it('can exclude id', () => {
    const filteredUserList = useUserList(['a'])
    expect(filteredUserList.value).toStrictEqualArrayIgnoringOrder([
      userActive,
      userInactive,
      userBot,
      userWebhook
    ])
  })

  it('user is reactive', () => {
    const filteredUserList = useUserList([])

    const { usersMap } = useUsersStore()
    usersMap.value.set('b', userB)

    expect(filteredUserList.value).toStrictEqualArrayIgnoringOrder([
      userActive,
      userInactive,
      userBot,
      userWebhook,
      userA,
      userB
    ])
  })
  it('exclude is reactive', () => {
    const exclude = ref<string[]>([])
    const filteredUserList = useUserList(exclude)

    exclude.value.push('inactive', 'bot')

    expect(filteredUserList.value).toStrictEqualArrayIgnoringOrder([
      userActive,
      userA
    ])
  })
})

const userActive: User = {
  id: 'active',
  name: 'active',
  displayName: 'active',
  iconFileId: '',
  state: UserAccountState.active,
  bot: false,
  updatedAt: '2020-03-18T04:17:10.177846Z'
}
const userInactive: User = {
  id: 'inactive',
  name: 'inactive',
  displayName: 'inactive',
  iconFileId: '',
  state: UserAccountState.deactivated,
  bot: false,
  updatedAt: '2020-03-18T04:17:10.177846Z'
}
const userBot: User = {
  id: 'bot',
  name: 'bot',
  displayName: 'bot',
  iconFileId: '',
  state: UserAccountState.active,
  bot: true,
  updatedAt: '2020-03-18T04:17:10.177846Z'
}
const userWebhook: User = {
  id: 'webhook',
  name: 'Webhook#webhook', // webhook starts with "Webhook#"
  displayName: 'webhook',
  iconFileId: '',
  state: UserAccountState.active,
  bot: true, // webhook is a bot
  updatedAt: '2020-03-18T04:17:10.177846Z'
}
const userA: User = {
  id: 'a',
  name: 'a',
  displayName: 'a',
  iconFileId: '',
  state: UserAccountState.active,
  bot: false,
  updatedAt: '2020-03-18T04:17:10.177846Z'
}
const userB: User = {
  id: 'b',
  name: 'b',
  displayName: 'b',
  iconFileId: '',
  state: UserAccountState.active,
  bot: false,
  updatedAt: '2020-03-18T04:17:10.177846Z'
}
