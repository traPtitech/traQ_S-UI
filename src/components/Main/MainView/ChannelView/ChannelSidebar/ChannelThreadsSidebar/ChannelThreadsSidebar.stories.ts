import {
  getCurrentInstance,
  inject,
  provide,
  shallowReactive,
  watch
} from 'vue'
import {
  createMemoryHistory,
  createRouter,
  routeLocationKey,
  routerKey
} from 'vue-router'

import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, fireEvent, userEvent, within } from 'storybook/test'

import { initializeMeta } from '/@/lib/apis'
import { useChannelsStore } from '/@/store/entities/channels'
import { useGroupsStore } from '/@/store/entities/groups'
import { useStampsStore } from '/@/store/entities/stamps'
import { useUsersStore } from '/@/store/entities/users'

import ChannelThreadsSidebar from './ChannelThreadsSidebar.vue'
import { mockThreadParentChannelId } from './mockThreads'

const meta = {
  title: 'Main/Channel/ChannelThreadsSidebar',
  component: ChannelThreadsSidebar,
  parameters: { docs: { story: { autoplay: true } } },
  args: { channelId: mockThreadParentChannelId },
  argTypes: { channelId: { control: false } },
  beforeEach: async () => {
    const config = window.traQConfig
    window.traQConfig = { ...config, backendOrigin: location.origin }
    try {
      await initializeMeta()
    } finally {
      window.traQConfig = config
    }
  },
  render: args => ({
    components: { ChannelThreadsSidebar },
    setup() {
      const router = createRouter({
        history: createMemoryHistory(),
        routes: [
          { path: '/:pathMatch(.*)*', component: { render: () => null } }
        ]
      })
      const route = shallowReactive({ ...router.currentRoute.value })
      watch(router.currentRoute, current => Object.assign(route, current))
      provide(routerKey, router)
      provide(routeLocationKey, route)

      // Pinia内のuseRouter()から参照できるよう、アプリにも提供する。
      const app = getCurrentInstance()?.appContext.app
      if (app && !app.runWithContext(() => inject(routerKey, null))) {
        app.provide(routerKey, router)
      }

      const channels = useChannelsStore()
      channels.channelsMap.value.set(args.channelId, {
        id: args.channelId,
        name: 'general',
        parentId: null,
        parentMessageId: null,
        children: [],
        topic: '',
        archived: false,
        force: false
      })
      channels.bothChannelsMapFetched.value = true

      // 本文描画が初期取得を待ち続けないよう、Promiseを解決済みにする。
      useUsersStore().usersMapInitialFetchPromise = Promise.resolve()
      useGroupsStore().userGroupsMapInitialFetchPromise = Promise.resolve()
      useStampsStore().stampsMapInitialFetchPromise = Promise.resolve()
      return { args }
    },
    template: `
      <div style="height: min(800px, calc(100vh - 48px));">
        <ChannelThreadsSidebar v-bind="args" />
      </div>
    `
  })
} satisfies Meta<typeof ChannelThreadsSidebar>

export default meta

export const Default: StoryObj<typeof meta> = {}

export const Archived: StoryObj<typeof meta> = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      canvas.getByRole('button', {
        name: 'アーカイブ済みのスレッドのみ表示'
      })
    )
    await expect(
      canvas.getByRole('heading', { name: 'アーカイブ済み (3)' })
    ).toBeVisible()
  }
}

export const SearchResults: StoryObj<typeof meta> = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox', {
      name: 'スレッドのタイトルを検索'
    })
    // Docsで複数の例を同時に表示しても、入力フォーカスを奪い合わないようにする。
    await fireEvent.input(input, { target: { value: '相談' } })
    await expect(input).toHaveValue('相談')
    await expect(
      canvas.getByRole('heading', { name: 'アクティブ (2)' })
    ).toBeVisible()
  }
}

export const NoSearchResults: StoryObj<typeof meta> = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox', {
      name: 'スレッドのタイトルを検索'
    })
    await fireEvent.input(input, { target: { value: '見つからないタイトル' } })
    await expect(input).toHaveValue('見つからないタイトル')
    await expect(canvas.getByText('一致するスレッドがありません')).toBeVisible()
  }
}
