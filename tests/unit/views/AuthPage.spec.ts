import type { MyUserDetail } from '@traptitech/traq'
import { UserAccountState } from '@traptitech/traq'

import { defineComponent } from 'vue'

import type { VueWrapper } from '@vue/test-utils'
import { flushPromises, mount } from '@vue/test-utils'
import { AxiosHeaders } from 'axios'
import { createPinia } from 'pinia'
import type { MockInstance } from 'vitest'

import AuthenticateMainView from '/@/components/Authenticate/AuthenticateMainView.vue'
import apis from '/@/lib/apis'
import router, { RouteName } from '/@/router'
import useLoginCheck from '/@/views/composables/useLoginCheck'

vi.mock('/@/lib/websocket', () => ({
  wsListener: { on: vi.fn() }
}))

vi.mock('/@/lib/notification/notification', () => ({
  deleteToken: vi.fn()
}))

vi.mock('/@/components/Authenticate/AuthenticateMainView.vue', () => ({
  default: {
    props: ['show', 'type'],
    render: () => null
  }
}))

vi.mock('/@/views/MainPage.vue', () => ({
  default: { render: () => null }
}))

const me: MyUserDetail = {
  id: 'test-user',
  name: 'test-user',
  displayName: 'Test User',
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

const meResponse = {
  data: me,
  status: 200,
  statusText: 'OK',
  headers: {},
  config: { headers: new AxiosHeaders() }
}

// App.vue と同じく、認証画面を再利用しながらルートの props を切り替える。
const AuthRouter = defineComponent({
  template: `
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
  `
})

describe('AuthPage', () => {
  const pinia = createPinia()

  let getMe: MockInstance<typeof apis.getMe>
  let wrapper: VueWrapper | undefined

  const mountPage = () => {
    wrapper = mount(AuthRouter, {
      global: { plugins: [pinia, router] }
    })
    return wrapper
  }

  beforeEach(() => {
    getMe = vi.spyOn(apis, 'getMe').mockRejectedValue({
      isAxiosError: true,
      response: { status: 401 }
    })
  })

  afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('preserves the OAuth return URL when the login-page session check returns 401', async () => {
    const returnUrl =
      '/api/v3/oauth2/authorize?client_id=test&response_type=code&state=original-state'

    await router.replace({
      name: RouteName.Login,
      query: { redirect: returnUrl }
    })

    const page = mountPage()
    await flushPromises()

    expect(getMe).toHaveBeenCalledOnce()
    expect(router.currentRoute.value.name).toBe(RouteName.Login)
    expect(router.currentRoute.value.query['redirect']).toBe(returnUrl)
    expect(new URL(location.href).searchParams.get('redirect')).toBe(returnUrl)
    expect(page.getComponent(AuthenticateMainView).props('show')).toBe(true)
  })

  it('shows the login page without a return URL when logged out', async () => {
    await router.replace({ name: RouteName.Login })
    const page = mountPage()
    await flushPromises()

    expect(getMe).toHaveBeenCalledOnce()
    expect(router.currentRoute.value.fullPath).toBe('/login')
    expect(page.getComponent(AuthenticateMainView).props()).toMatchObject({
      type: RouteName.Login,
      show: true
    })
  })

  it('keeps the registration page open when logged out without retrying 401', async () => {
    await router.replace({ name: RouteName.Registration })
    const page = mountPage()
    await flushPromises()

    expect(getMe).toHaveBeenCalledOnce()
    expect(router.currentRoute.value.name).toBe(RouteName.Registration)
    expect(page.getComponent(AuthenticateMainView).props()).toMatchObject({
      type: RouteName.Registration,
      show: true
    })
  })

  it('sends a logged-out consent visitor to login while preserving the consent URL', async () => {
    await router.replace({
      name: RouteName.Consent,
      query: {
        client_id: 'test',
        scopes: 'read write',
        state: 'original-state'
      }
    })
    const consentUrl = router.currentRoute.value.fullPath
    const page = mountPage()
    await flushPromises()

    expect(getMe).toHaveBeenCalledTimes(2)
    expect(router.currentRoute.value.name).toBe(RouteName.Login)
    expect(router.currentRoute.value.query['redirect']).toBe(consentUrl)
    expect(page.getComponent(AuthenticateMainView).props()).toMatchObject({
      type: RouteName.Login,
      show: true
    })
  })

  it.each([RouteName.Login, RouteName.Registration])(
    'sends an already logged-in %s visitor to the main page',
    async name => {
      getMe.mockResolvedValue(meResponse)
      await router.replace({ name })
      const page = mountPage()
      await flushPromises()

      expect(getMe).toHaveBeenCalledOnce()
      expect(router.currentRoute.value.name).toBe(RouteName.Index)
      expect(page.findComponent(AuthenticateMainView).exists()).toBe(false)
    }
  )

  it('honors an internal return URL when already logged in', async () => {
    getMe.mockResolvedValue(meResponse)
    const returnUrl = '/channels/test?message=message-id'
    await router.replace({
      name: RouteName.Login,
      query: { redirect: returnUrl }
    })
    mountPage()
    await flushPromises()

    expect(getMe).toHaveBeenCalledOnce()
    expect(router.currentRoute.value.fullPath).toBe(returnUrl)
  })

  it('shows consent when already logged in', async () => {
    getMe.mockResolvedValue(meResponse)
    await router.replace({
      name: RouteName.Consent,
      query: { client_id: 'test', scopes: 'read' }
    })
    const consentUrl = router.currentRoute.value.fullPath
    const page = mountPage()
    await flushPromises()

    expect(getMe).toHaveBeenCalledOnce()
    expect(router.currentRoute.value.fullPath).toBe(consentUrl)
    expect(page.getComponent(AuthenticateMainView).props()).toMatchObject({
      type: RouteName.Consent,
      show: true
    })
  })

  it('switches between login and registration without redirect loops', async () => {
    await router.replace({ name: RouteName.Login })
    const page = mountPage()
    await flushPromises()

    await router.push({ name: RouteName.Registration })
    await flushPromises()
    expect(router.currentRoute.value.name).toBe(RouteName.Registration)
    expect(page.getComponent(AuthenticateMainView).props('type')).toBe(
      RouteName.Registration
    )

    await router.push({ name: RouteName.Login })
    await flushPromises()
    expect(getMe).toHaveBeenCalledTimes(3)
    expect(router.currentRoute.value.name).toBe(RouteName.Login)
    expect(page.getComponent(AuthenticateMainView).props('show')).toBe(true)
  })

  it('still redirects a logged-out visitor away from a protected page', async () => {
    const removeRoute = router.addRoute({
      path: '/auth-test-protected',
      component: {
        setup() {
          useLoginCheck()
          return () => null
        }
      }
    })
    try {
      await router.replace('/auth-test-protected')
      const page = mountPage()
      await flushPromises()

      expect(router.currentRoute.value.name).toBe(RouteName.Login)
      expect(page.getComponent(AuthenticateMainView).props('show')).toBe(true)
    } finally {
      removeRoute()
    }
  })

  it('still retries a server error during the authentication check', async () => {
    vi.useFakeTimers()
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    getMe
      .mockRejectedValueOnce({
        isAxiosError: true,
        response: { status: 500 }
      })
      .mockResolvedValue(meResponse)

    await router.replace({
      name: RouteName.Consent,
      query: { client_id: 'test', scopes: 'read' }
    })

    const page = mountPage()
    await flushPromises()
    expect(getMe).toHaveBeenCalledOnce()

    await vi.advanceTimersByTimeAsync(1000)
    await flushPromises()

    expect(getMe).toHaveBeenCalledTimes(2)
    expect(router.currentRoute.value.name).toBe(RouteName.Consent)
    expect(page.getComponent(AuthenticateMainView).props('show')).toBe(true)
  })
})
