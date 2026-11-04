import type { Message } from '@traptitech/traq'

import { ref } from 'vue'

import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { AxiosError } from 'axios'
import { createPinia, setActivePinia } from 'pinia'

import type * as ApisModule from '/@/lib/apis'
import boolAttr from '/@/bool-attr'
import ThreadSidebarParentMessage from '/@/components/Main/MainView/ThreadView/ThreadSidebar/ThreadSidebarParentMessage.vue'
import MessagePanel from '/@/components/UI/MessagePanel/MessagePanel.vue'
import { messageMitt, useMessagesStore } from '/@/store/entities/messages'

const { getMessage } = vi.hoisted(() => ({ getMessage: vi.fn() }))
vi.mock('/@/lib/apis', async importOriginal => {
  const original = await importOriginal<typeof ApisModule>()
  return {
    ...original,
    default: Object.assign(original.default, { getMessage })
  }
})
vi.mock('/@/store/domain/me', () => ({
  useMeStore: () => ({ myId: ref('me') })
}))

const message: Message = {
  id: 'parent',
  userId: 'author',
  channelId: 'channel',
  content: '親の本文',
  createdAt: '',
  updatedAt: '',
  pinned: false,
  stamps: [],
  threadId: null
}
const mountParent = () =>
  mount(ThreadSidebarParentMessage, {
    props: { messageId: 'parent' },
    global: { plugins: [boolAttr], stubs: { MessagePanel: true } }
  })
beforeEach(() => {
  setActivePinia(createPinia())
  useMessagesStore().messagesMap.value.clear()
  getMessage.mockReset()
  getMessage.mockResolvedValue({ data: message })
})
enableAutoUnmount(afterEach)

test('revalidates cached parents on each display and keeps the path in the message link', async () => {
  const { messagesMap } = useMessagesStore()
  messagesMap.value.set('parent', { ...message, content: '古い本文' })
  let finish!: (response: { data: Message }) => void
  getMessage.mockImplementationOnce(
    () => new Promise(resolve => (finish = resolve))
  )
  const wrapper = mountParent()
  expect(wrapper.get('[role="status"]').text()).toContain('読み込み中')
  expect(wrapper.findComponent(MessagePanel).exists()).toBe(false)
  finish({ data: message })
  await flushPromises()
  expect(getMessage).toHaveBeenCalledExactlyOnceWith('parent')
  expect(wrapper.getComponent(MessagePanel).props()).toMatchObject({
    message,
    to: '/messages/parent',
    titleType: 'user',
    hideSubtitle: false,
    lineClampContent: true,
    embedded: true
  })
  expect(wrapper.text()).toContain('親メッセージ')
  expect(wrapper.find('button').exists()).toBe(false)

  wrapper.unmount()
  const reopened = mountParent()
  await flushPromises()
  expect(getMessage).toHaveBeenCalledTimes(2)
  messagesMap.value.delete('parent')
  await flushPromises()
  expect(reopened.text()).toContain('削除されたか、表示できません')
  expect(reopened.findComponent(MessagePanel).exists()).toBe(false)
})

test.each([403, 404])(
  'hides cached content when reconnect revalidation returns %s',
  async status => {
    const wrapper = mountParent()
    await flushPromises()
    const { messagesMap } = useMessagesStore()
    const error = new AxiosError('unavailable')
    error.response = { status } as never
    getMessage.mockRejectedValueOnce(error)

    messageMitt.emit('reconnect')
    await flushPromises()
    expect(getMessage).toHaveBeenCalledTimes(2)
    expect(messagesMap.value.get('parent')).toEqual(message)
    expect(wrapper.text()).toContain('削除されたか、表示できません')
    expect(wrapper.findComponent(MessagePanel).exists()).toBe(false)
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)

    messagesMap.value.set('parent', { ...message, content: '別の取得結果' })
    await flushPromises()
    expect(wrapper.findComponent(MessagePanel).exists()).toBe(false)
    wrapper.unmount()
    messageMitt.emit('reconnect')
    await flushPromises()
    expect(getMessage).toHaveBeenCalledTimes(2)
  }
)

test('hides cached content after a network failure and restores it after retry', async () => {
  const { messagesMap } = useMessagesStore()
  messagesMap.value.set('parent', message)
  getMessage.mockRejectedValueOnce(new Error('offline'))
  const wrapper = mountParent()
  await flushPromises()
  expect(wrapper.get('[role="alert"]').text()).toContain('取得できませんでした')
  expect(wrapper.findComponent(MessagePanel).exists()).toBe(false)
  expect(messagesMap.value.get('parent')).toEqual(message)

  messagesMap.value.set('parent', { ...message, content: '別の取得結果' })
  await flushPromises()
  expect(wrapper.findComponent(MessagePanel).exists()).toBe(false)
  await wrapper.get('button').trigger('click')
  await flushPromises()
  expect(getMessage).toHaveBeenCalledTimes(2)
  expect(wrapper.getComponent(MessagePanel).props('message')).toEqual(message)
  expect(wrapper.find('[role="alert"]').exists()).toBe(false)
})

test.each(['success', 'failure'])(
  'ignores a late %s from the previous parent while the new parent is loading',
  async result => {
    let finishPrevious!: (response: { data: Message }) => void
    let failPrevious!: (reason: Error) => void
    let finishNext!: (response: { data: Message }) => void
    getMessage.mockImplementationOnce(
      () =>
        new Promise((resolve, reject) => {
          finishPrevious = resolve
          failPrevious = reject
        })
    )
    const wrapper = mountParent()
    const next = { ...message, id: 'next' }
    useMessagesStore().messagesMap.value.set('next', next)
    getMessage.mockImplementationOnce(
      () => new Promise(resolve => (finishNext = resolve))
    )
    await wrapper.setProps({ messageId: 'next' })

    if (result === 'success') finishPrevious({ data: message })
    else failPrevious(new Error('late failure'))
    await flushPromises()
    expect(wrapper.get('[role="status"]').text()).toContain('読み込み中')
    expect(wrapper.findComponent(MessagePanel).exists()).toBe(false)
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)

    finishNext({ data: next })
    await flushPromises()
    expect(wrapper.getComponent(MessagePanel).props('to')).toBe(
      '/messages/next'
    )
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  }
)
