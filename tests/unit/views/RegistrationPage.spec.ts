import type { MyUserDetail } from '@traptitech/traq'
import { UserAccountState } from '@traptitech/traq'

import { defineComponent } from 'vue'

import type { VueWrapper } from '@vue/test-utils'
import { flushPromises, mount } from '@vue/test-utils'
import { AxiosHeaders } from 'axios'
import { createPinia } from 'pinia'

import apis from '/@/lib/apis'
import router, { RouteName } from '/@/router'
import { useMeStore } from '/@/store/domain/me'

vi.mock('/@/lib/websocket', () => ({
  wsListener: { on: vi.fn() }
}))

vi.mock('/@/lib/notification/notification', () => ({
  deleteToken: vi.fn()
}))

vi.mock('/@/views/MainPage.vue', () => ({
  default: { render: () => null }
}))

const response = <T>(data: T, status = 200) => ({
  data,
  status,
  statusText: '',
  headers: {},
  config: { headers: new AxiosHeaders() }
})

const createdUser: MyUserDetail = {
  id: 'new-user-id',
  name: 'new-user',
  displayName: 'New User',
  iconFileId: '',
  bot: false,
  state: UserAccountState.active,
  bio: '',
  groups: [],
  tags: [],
  updatedAt: '2026-01-01T00:00:00Z',
  lastOnline: null,
  twitterId: '',
  permissions: [],
  homeChannel: null
}

let useDefaultAuthErrorHandling = false

const RegistrationRouter = defineComponent({
  setup() {
    const store = useMeStore()
    if (useDefaultAuthErrorHandling) {
      // 比較用: false の指定も外して fetchMe() に戻した場合を再現する。
      const fetchMe = store.fetchMe
      vi.spyOn(store, 'fetchMe').mockImplementation(() => fetchMe())
    }
  },
  template: `
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
  `
})

describe('RegistrationPage', () => {
  const pinia = createPinia()
  let wrapper: VueWrapper | undefined

  const mountPage = () => {
    wrapper = mount(RegistrationRouter, {
      global: { plugins: [pinia, router] }
    })
    return wrapper
  }

  beforeAll(async () => {
    await router.replace({ name: RouteName.Login })
  })

  beforeEach(() => {
    useDefaultAuthErrorHandling = false
    vi.spyOn(apis, 'getMe').mockRejectedValue({
      isAxiosError: true,
      response: { status: 401 }
    })
    vi.spyOn(apis, 'getServerVersion').mockResolvedValue(
      response({
        revision: 'test',
        version: 'test',
        flags: { externalLogin: [], signUpAllowed: true }
      })
    )
    vi.spyOn(apis, 'createUser').mockResolvedValue(response(createdUser, 201))
    vi.spyOn(apis, 'login').mockResolvedValue(response(undefined, 204))
  })

  afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
    vi.restoreAllMocks()
  })

  it('opens registration from login and submits the account before logging in', async () => {
    await router.replace({ name: RouteName.Login })
    const page = mountPage()
    await flushPromises()

    await page.get('a[href="/registration"]').trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.name).toBe(RouteName.Registration)

    await page.get('input[autocomplete="username"]').setValue('new-user')
    await page
      .get('input[autocomplete="new-password"]')
      .setValue('new-user-password')
    await page.get('button[type="submit"]').trigger('click')
    await flushPromises()

    expect(apis.createUser).toHaveBeenCalledExactlyOnceWith({
      name: 'new-user',
      password: 'new-user-password'
    })
    expect(apis.login).toHaveBeenCalledExactlyOnceWith(undefined, {
      name: 'new-user',
      password: 'new-user-password'
    })
    expect(apis.createUser).toHaveBeenCalledBefore(vi.mocked(apis.login))
    expect(router.currentRoute.value.name).toBe(RouteName.Index)
  })

  it('reproduces the registration redirect if false is also removed from fetchMe', async () => {
    useDefaultAuthErrorHandling = true
    await router.replace({ name: RouteName.Registration })
    const page = mountPage()
    await flushPromises()

    expect(router.currentRoute.value.name).toBe(RouteName.Login)
    expect(page.find('input[autocomplete="new-password"]').exists()).toBe(false)
    expect(apis.createUser).not.toHaveBeenCalled()
  })

  it('keeps registration disabled when the server disallows sign-up', async () => {
    vi.mocked(apis.getServerVersion).mockResolvedValue(
      response({
        revision: 'test',
        version: 'test',
        flags: { externalLogin: [], signUpAllowed: false }
      })
    )
    await router.replace({ name: RouteName.Login })
    const page = mountPage()
    await flushPromises()
    expect(page.find('a[href="/registration"]').exists()).toBe(false)

    await router.push({ name: RouteName.Registration })
    await flushPromises()
    expect(page.find('input[autocomplete="new-password"]').exists()).toBe(false)
    expect(apis.createUser).not.toHaveBeenCalled()
  })

  it('shows a creation error without logging in or leaving registration', async () => {
    vi.mocked(apis.createUser).mockRejectedValue({
      response: { status: 409, data: { message: 'name conflicts' } }
    })
    await router.replace({ name: RouteName.Registration })
    const page = mountPage()
    await flushPromises()

    await page.get('input[autocomplete="username"]').setValue('new-user')
    await page
      .get('input[autocomplete="new-password"]')
      .setValue('new-user-password')
    await page.get('button[type="submit"]').trigger('click')
    await flushPromises()

    expect(page.text()).toContain('そのIDは既に使用されています')
    expect(router.currentRoute.value.name).toBe(RouteName.Registration)
    expect(
      page.get<HTMLInputElement>('input[autocomplete="new-password"]').element
        .value
    ).toBe('new-user-password')
    expect(apis.login).not.toHaveBeenCalled()
  })
})
