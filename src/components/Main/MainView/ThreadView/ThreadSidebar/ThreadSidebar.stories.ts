import type {
  Message,
  PatchThreadRequest,
  User,
  UserPermission
} from '@traptitech/traq'

import { onMounted, onUnmounted, ref } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'

import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { setup } from '@storybook/vue3-vite'
import axios, { AxiosError, AxiosHeaders } from 'axios'

import { initializeMeta } from '/@/lib/apis'
import { useMeStore } from '/@/store/domain/me'
import { useChannelsStore } from '/@/store/entities/channels'
import { useGroupsStore } from '/@/store/entities/groups'
import { useMessagesStore } from '/@/store/entities/messages'
import { useStampsStore } from '/@/store/entities/stamps'
import { type ThreadChannel, useThreadsStore } from '/@/store/entities/threads'
import { useUsersStore } from '/@/store/entities/users'
import { MainViewComponentState, useMainViewStore } from '/@/store/ui/mainView'

import ThreadSidebar from './ThreadSidebar.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: '/:pathMatch(.*)*', component: { template: '<div />' } }]
})
setup(app => {
  app.use(router)
})
const threadId = '30000000-0000-4000-8000-000000000001'
const parentId = '10000000-0000-4000-8000-000000000001'
const parentMessageId = '40000000-0000-4000-8000-000000000001'
const date = '2026-11-03T00:00:00Z'
const users: User[] = [
  'yasako',
  'sora',
  'haru',
  'Notify Bot',
  'viewer4',
  'viewer5',
  'viewer6'
].map((name, index) => ({
  id: `20000000-0000-4000-8000-00000000000${index + 1}`,
  name,
  displayName: name,
  iconFileId: 'android-chrome-192x192.png',
  bot: index === 3,
  state: 1,
  updatedAt: date
}))
const author = users[0]
if (!author) throw new Error('Missing story author')
const message: Message = {
  id: parentMessageId,
  userId: author.id,
  channelId: parentId,
  content: '親メッセージの投稿'.repeat(5),
  createdAt: date,
  updatedAt: date,
  pinned: false,
  stamps: [],
  threadId
}

type Args = InstanceType<typeof ThreadSidebar>['$props'] & {
  archived: boolean
  failSaving: boolean
  editable: boolean
  missingParent: boolean
}
const meta = {
  title: 'Main/Thread/ThreadSidebar',
  component: ThreadSidebar,
  parameters: {
    layout: 'fullscreen',
    docs: { story: { inline: false, height: '950px' } }
  },
  beforeEach: async () => {
    window.traQConfig = { ...window.traQConfig, backendOrigin: location.origin }
    await initializeMeta()
  },
  args: {
    channelId: threadId,
    isSidebarOpenerReady: true,
    pinnedMessages: [
      {
        userId: author.id,
        pinnedAt: date,
        message: { ...message, channelId: threadId }
      }
    ],
    activeViewingUsers: users.filter(u => !u.bot).map(u => u.id),
    inactiveViewingUsers: [],
    archived: false,
    failSaving: false,
    editable: true,
    missingParent: false
  },
  render: args => ({
    components: { ThreadSidebar },
    setup() {
      const isReady = ref(false)
      // モバイル用Teleport先をDOMへ配置してからサイドバーをマウントする。
      onMounted(() => {
        isReady.value = true
      })
      let thread: ThreadChannel = {
        id: threadId,
        name: 'スレッドタイトル'.repeat(3),
        parentId,
        parentMessageId,
        archived: args.archived,
        force: false,
        topic: '',
        children: []
      }
      const previousAdapter = axios.defaults.adapter
      // Story内のAPIだけを模擬し、実サーバーへは送信しない。
      axios.defaults.adapter = async config => {
        const path = (config.url ?? '').split('?')[0] ?? ''
        if (config.method === 'patch' && args.failSaving)
          throw new AxiosError('保存失敗の表示例', 'ERR_NETWORK', config)
        if (
          config.method === 'patch' &&
          path.endsWith(`/threads/${threadId}`)
        ) {
          const patch: PatchThreadRequest = JSON.parse(config.data)
          thread = { ...thread, ...patch }
          // 保存成功後のWS通知によるstore更新も模擬する。
          useThreadsStore().setThread(thread)
        }
        if (path.includes('/messages/') && args.missingParent)
          throw new AxiosError(
            'not found',
            'ERR_BAD_REQUEST',
            config,
            undefined,
            {
              status: 404,
              statusText: 'Not Found',
              config,
              headers: new AxiosHeaders(),
              data: {}
            }
          )
        let data: unknown = []
        if (path.endsWith('/users')) data = users
        else if (path.endsWith('/subscribers'))
          data = users.slice(1, 3).map(user => user.id)
        else if (path.endsWith('/bots'))
          data = users
            .filter(user => user.bot)
            .map(user => ({ botUserId: user.id }))
        else if (path.includes('/messages/')) data = message
        else if (path.includes('/users/'))
          data = users.find(u => path.endsWith(u.id))
        return {
          config,
          data,
          status: 200,
          statusText: 'OK',
          headers: new AxiosHeaders()
        }
      }
      onUnmounted(() => {
        axios.defaults.adapter = previousAdapter
      })
      const userStore = useUsersStore()
      userStore.usersMap.value = new Map(users.map(u => [u.id, u]))
      userStore.fetchUsers()
      useGroupsStore().fetchUserGroups()
      useStampsStore().fetchStamps()
      useMeStore().detail.value = {
        ...author,
        bio: '',
        groups: [],
        tags: [],
        lastOnline: null,
        twitterId: '',
        homeChannel: null,
        permissions: args.editable ? ['edit_thread' as UserPermission] : []
      }
      const channels = useChannelsStore()
      channels.channelsMap.value = new Map([
        [
          parentId,
          {
            id: parentId,
            name: 'team/SysAd/traQ/traQ',
            parentId: null,
            parentMessageId: null,
            archived: false,
            force: false,
            topic: '',
            children: []
          }
        ]
      ])
      channels.bothChannelsMapFetched.value = true
      useThreadsStore().setThread(thread)
      const messages = useMessagesStore()
      messages.messagesMap.value.clear()
      if (!args.missingParent) messages.extendMessagesMap([message])
      const view = useMainViewStore()
      view.primaryView.value = { type: 'thread', channelId: threadId }
      view.currentMainViewComponentState.value =
        MainViewComponentState.SidebarShown
      return {
        isReady,
        args: {
          channelId: args.channelId,
          isSidebarOpenerReady: args.isSidebarOpenerReady,
          pinnedMessages: args.pinnedMessages,
          activeViewingUsers: args.activeViewingUsers,
          inactiveViewingUsers: args.inactiveViewingUsers
        }
      }
    },
    template:
      '<div style="height: 950px; width: 320px"><div id="sidebar-mobile"/><div id="sidebar-opener"/><ThreadSidebar v-if="isReady" v-bind="args" /></div>'
  })
} satisfies Meta<Args>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Archived: Story = { args: { archived: true } }
export const SaveFailure: Story = { args: { failSaving: true } }
export const MissingParent: Story = { args: { missingParent: true } }
export const ReadOnly: Story = { args: { editable: false } }
export const Dark: Story = { globals: { theme: 'dark' } }
