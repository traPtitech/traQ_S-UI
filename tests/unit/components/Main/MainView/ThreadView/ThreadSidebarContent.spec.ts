import { ref } from 'vue'

import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import axios from 'axios'
import type { Emitter } from 'mitt'
import { createPinia, setActivePinia } from 'pinia'

import boolAttr from '/@/bool-attr'
import ThreadSidebarContent from '/@/components/Main/MainView/ThreadView/ThreadSidebar/ThreadSidebarContent.vue'
import apis from '/@/lib/apis'
import { wsListener } from '/@/lib/websocket'
import type { WebSocketEvent } from '/@/lib/websocket/events'
import { useChannelsStore } from '/@/store/entities/channels'
import { useThreadsStore } from '/@/store/entities/threads'

vi.mock('/@/store/domain/me', () => ({ useMeStore: () => ({ detail }) }))
vi.mock('/@/store/entities/users', () => ({
  useUsersStore: () => ({
    activeUsersMap: ref(new Map()),
    usersMap: ref(new Map())
  })
}))
vi.mock('/@/composables/subscription/useChannelSubscribers', () => ({
  default: () => ref(new Set())
}))
vi.mock(
  '/@/components/Main/MainView/ChannelView/ChannelSidebar/ChannelInformationSidebar/composables/useChannelBots',
  () => ({ default: () => ref([]) })
)

const detail = ref({ permissions: ['edit_thread'] })
const firstId = '10000000-0000-4000-8000-000000000001'
const secondId = '10000000-0000-4000-8000-000000000002'
const thread = (id = firstId, name = '元の名前') => ({
  id,
  name,
  parentId: 'parent',
  parentMessageId: 'message',
  archived: false,
  force: false,
  topic: '',
  children: []
})
const response = {
  data: undefined,
  status: 204,
  statusText: 'No Content',
  headers: {},
  config: { headers: {} }
}

beforeEach(() => {
  setActivePinia(createPinia())
  useThreadsStore().threadsMap.value.clear()
  useThreadsStore().setThread(thread())
  useThreadsStore().setThread(thread(secondId, '別の名前'))
  useChannelsStore()
  detail.value = { permissions: ['edit_thread'] }
  vi.spyOn(apis, 'editThread').mockResolvedValue(response as never)
  vi.spyOn(axios, 'request').mockRejectedValue(
    new Error('Unexpected API request')
  )
})
afterEach(() => vi.restoreAllMocks())
enableAutoUnmount(afterEach)

const mountSidebar = (channelId = firstId) =>
  mount(ThreadSidebarContent, {
    props: {
      channelId,
      viewerIds: [],
      inactiveViewerIds: [],
      isViewersDetailOpen: false,
      pinnedMessagesCount: 2
    },
    global: {
      plugins: [boolAttr],
      stubs: {
        ThreadSidebarParentMessage: true,
        ChannelInformationSidebarViewers: true,
        ThreadSidebarUsers: true
      }
    }
  })
const button = (wrapper: ReturnType<typeof mountSidebar>, label: string) => {
  const result = wrapper.findAll('button').find(b => b.text() === label)
  if (!result) throw new Error(`Missing button: ${label}`)
  return result
}
const beginEditing = async (
  wrapper: ReturnType<typeof mountSidebar>,
  value: string
) => {
  await wrapper.get('[aria-label="スレッド名を変更"]').trigger('click')
  await wrapper.get('textarea').setValue(value)
}
const events = wsListener as Emitter<WebSocketEvent & { reconnect: void }>
const publishThread = async (value: ReturnType<typeof thread>) => {
  vi.mocked(axios.request).mockResolvedValueOnce({
    ...response,
    status: 200,
    statusText: 'OK',
    data: value
  })
  events.emit('CHANNEL_UPDATED', { id: value.id })
  await flushPromises()
  expect(axios.request).toHaveBeenLastCalledWith(
    expect.objectContaining({
      method: 'GET',
      url: expect.stringContaining(`/channels/${value.id}`)
    })
  )
}

test('saves through the thread API and displays the subsequent WS update', async () => {
  const wrapper = mountSidebar()
  await beginEditing(wrapper, '新しい名前')
  await button(wrapper, '保存').trigger('click')
  await flushPromises()
  expect(apis.editThread).toHaveBeenCalledExactlyOnceWith(firstId, {
    name: '新しい名前'
  })
  expect(useThreadsStore().threadsMap.value.get(firstId)?.name).toBe('元の名前')
  expect(wrapper.find('textarea').exists()).toBe(false)
  await publishThread(thread(firstId, '新しい名前'))
  expect(useThreadsStore().threadsMap.value.get(firstId)?.name).toBe(
    '新しい名前'
  )
  expect(wrapper.text()).toContain('新しい名前')
})

test('cancels without a request and keeps the draft after a failed save', async () => {
  const wrapper = mountSidebar()
  await beginEditing(wrapper, '破棄する名前')
  await button(wrapper, 'キャンセル').trigger('click')
  expect(apis.editThread).not.toHaveBeenCalled()
  await beginEditing(wrapper, '再試行する名前')
  vi.mocked(apis.editThread).mockRejectedValueOnce(new Error('offline'))
  await button(wrapper, '保存').trigger('click')
  await flushPromises()
  expect(wrapper.get('textarea').element.value).toBe('再試行する名前')
  expect(wrapper.get('[role="alert"]').text()).toContain('名前の保存に失敗')
  expect(useThreadsStore().threadsMap.value.get(firstId)?.name).toBe('元の名前')
  await button(wrapper, '保存').trigger('click')
  await flushPromises()
  expect(apis.editThread).toHaveBeenLastCalledWith(firstId, {
    name: '再試行する名前'
  })
  await publishThread(thread(firstId, '再試行する名前'))
  expect(useThreadsStore().threadsMap.value.get(firstId)?.name).toBe(
    '再試行する名前'
  )
})

test('disables duplicate submissions and serializes name/archive actions', async () => {
  let finish!: () => void
  vi.mocked(apis.editThread).mockImplementation(
    () =>
      new Promise(resolve => {
        finish = () => resolve(response as never)
      })
  )
  const wrapper = mountSidebar()
  await beginEditing(wrapper, '保存中')
  await button(wrapper, '保存').trigger('click')
  expect(wrapper.get('textarea').element.readOnly).toBe(true)
  for (const element of wrapper.findAll('button'))
    expect(element.element.disabled).toBe(true)
  await button(wrapper, '保存').trigger('click')
  expect(apis.editThread).toHaveBeenCalledTimes(1)
  finish()
  await flushPromises()
})

test('archives and restores with explicit values; failed requests preserve the state', async () => {
  const wrapper = mountSidebar()
  vi.mocked(apis.editThread).mockRejectedValueOnce(new Error('offline'))
  await button(wrapper, 'アーカイブ').trigger('click')
  await flushPromises()
  expect(useThreadsStore().threadsMap.value.get(firstId)?.archived).toBe(false)
  expect(wrapper.get('[role="alert"]').text()).toContain(
    'アーカイブ状態の変更に失敗'
  )
  await button(wrapper, 'アーカイブ').trigger('click')
  await flushPromises()
  expect(apis.editThread).toHaveBeenLastCalledWith(firstId, { archived: true })
  expect(useThreadsStore().threadsMap.value.get(firstId)?.archived).toBe(false)
  await publishThread({ ...thread(), archived: true })
  expect(useThreadsStore().threadsMap.value.get(firstId)?.archived).toBe(true)
  await button(wrapper, 'アーカイブ解除').trigger('click')
  await flushPromises()
  expect(apis.editThread).toHaveBeenLastCalledWith(firstId, { archived: false })
  expect(useThreadsStore().threadsMap.value.get(firstId)?.archived).toBe(true)
  await publishThread(thread())
  expect(useThreadsStore().threadsMap.value.get(firstId)?.archived).toBe(false)
})

test('hides edit controls without the thread permission, regardless of EditChannel', () => {
  detail.value = { permissions: ['edit_channel'] }
  const wrapper = mountSidebar()
  expect(wrapper.text()).toContain('元の名前')
  expect(wrapper.find('button').exists()).toBe(false)
})

test.each(['success', 'failure'])(
  'a late %s after remount does not affect editing on the new thread',
  async result => {
    let finish!: () => void
    vi.mocked(apis.editThread).mockImplementationOnce(
      () =>
        new Promise((resolve, reject) => {
          finish = () =>
            result === 'success'
              ? resolve(response as never)
              : reject(new Error('offline'))
        })
    )
    const wrapper = mountSidebar()
    await beginEditing(wrapper, '元のスレッドの変更')
    await button(wrapper, '保存').trigger('click')
    wrapper.unmount()
    const next = mountSidebar(secondId)
    await beginEditing(next, '移動後の入力')
    finish()
    await flushPromises()
    if (result === 'success')
      await publishThread(thread(firstId, '元のスレッドの変更'))
    expect(next.get('textarea').element.value).toBe('移動後の入力')
    expect(button(next, '保存').element.disabled).toBe(false)
    expect(next.find('[role="alert"]').exists()).toBe(false)
    expect(useThreadsStore().threadsMap.value.get(firstId)?.name).toBe(
      result === 'success' ? '元のスレッドの変更' : '元の名前'
    )
    expect(useThreadsStore().threadsMap.value.get(secondId)?.name).toBe(
      '別の名前'
    )
  }
)

test.each([
  [0, 1],
  [1, 0]
])(
  'API response order %s then %s does not overwrite WS state',
  async (first, last) => {
    const finish: (() => void)[] = []
    vi.mocked(apis.editThread).mockImplementation(
      () =>
        new Promise(resolve => finish.push(() => resolve(response as never)))
    )
    const wrapper = mountSidebar()
    await beginEditing(wrapper, '最初の保存')
    await button(wrapper, '保存').trigger('click')
    wrapper.unmount()
    const next = mountSidebar()
    await beginEditing(next, '後の保存')
    await button(next, '保存').trigger('click')
    expect(apis.editThread).toHaveBeenCalledTimes(2)
    const latest = {
      ...thread(firstId, 'WSで受信した最新の名前'),
      archived: true
    }
    await publishThread(latest)
    for (const index of [first, last]) {
      finish[index]?.()
      await flushPromises()
      expect(useThreadsStore().threadsMap.value.get(firstId)).toEqual(latest)
    }
    expect(next.text()).toContain(latest.name)
    expect(button(next, 'アーカイブ解除').exists()).toBe(true)
  }
)

test('does not resurrect a thread deleted while its save was pending', async () => {
  let finish!: () => void
  vi.mocked(apis.editThread).mockImplementationOnce(
    () =>
      new Promise(resolve => {
        finish = () => resolve(response as never)
      })
  )
  const wrapper = mountSidebar()
  await button(wrapper, 'アーカイブ').trigger('click')
  events.emit('CHANNEL_DELETED', { id: firstId })
  finish()
  await flushPromises()
  expect(useThreadsStore().threadsMap.value.has(firstId)).toBe(false)
})
