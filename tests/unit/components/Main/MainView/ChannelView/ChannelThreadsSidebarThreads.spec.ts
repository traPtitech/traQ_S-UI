import { enableAutoUnmount, mount } from '@vue/test-utils'

import * as mockThreads from '/@/components/Main/MainView/ChannelView/ChannelSidebar/ChannelThreadsSidebar/mockThreads'
import boolAttr from '/@/bool-attr'
import ChannelThreadsSidebarThreadCard from '/@/components/Main/MainView/ChannelView/ChannelSidebar/ChannelThreadsSidebar/ChannelThreadsSidebarThreadCard.vue'
import ChannelThreadsSidebarThreads from '/@/components/Main/MainView/ChannelView/ChannelSidebar/ChannelThreadsSidebar/ChannelThreadsSidebarThreads.vue'

vi.mock('/@/composables/useChannelPath', () => ({
  default: () => ({ channelIdToPathString: (id: string) => id })
}))
vi.mock('/@/router', () => ({
  constructChannelPath: (path: string) => `/channels/${path}`
}))

enableAutoUnmount(afterEach)
afterEach(() => vi.restoreAllMocks())

const mountList = () =>
  mount(ChannelThreadsSidebarThreads, {
    props: { channelId: 'general' },
    global: {
      plugins: [boolAttr],
      stubs: { ChannelThreadsSidebarThreadCard: true }
    }
  })

test('starts with active threads in latest-message order and switches exclusively to archived threads', async () => {
  const wrapper = mountList()
  const cards = () => wrapper.findAllComponents(ChannelThreadsSidebarThreadCard)
  expect(wrapper.get('h3').text()).toBe('アクティブ (5)')
  expect(cards().map(card => card.props('title'))).toEqual([
    '次回のミーティング',
    'サイドバーのデザイン相談',
    'タイトルが長いスレッドをサイドバーに表示したときの省略と折り返しを確認するための相談',
    'リリース後の振り返り',
    '動作確認メモ'
  ])
  expect(cards()[0]?.props('unread')).toMatchObject({ count: 3 })

  const toggle = wrapper.get('button')
  expect(toggle.attributes('aria-pressed')).toBe('false')
  await toggle.trigger('click')
  expect(toggle.attributes('aria-pressed')).toBe('true')
  expect(wrapper.get('h3').text()).toBe('アーカイブ済み (3)')
  expect(cards()).toHaveLength(3)
  for (const card of cards()) {
    expect(card.props('archived')).toBe(true)
    expect(card.props('unread')).toBeUndefined()
  }
})

test('filters titles and counts, keeps the query across states, and clears it with Escape', async () => {
  const wrapper = mountList()
  const input = wrapper.get('input')
  expect(input.attributes('type')).toBe('text')
  await input.setValue('相談')
  expect(wrapper.get('h3').text()).toBe('アクティブ (2)')
  await wrapper.get('button').trigger('click')
  expect(input.element.value).toBe('相談')
  expect(wrapper.get('h3').text()).toBe('アーカイブ済み (1)')
  await input.trigger('keydown', { key: 'Escape' })
  expect(input.element.value).toBe('')
  expect(wrapper.get('h3').text()).toBe('アーカイブ済み (3)')
})

test('supports one-character partial matches without searching the excerpt or author', async () => {
  const wrapper = mountList()
  const input = wrapper.get('input')
  await input.setValue('次')
  expect(wrapper.get('h3').text()).toBe('アクティブ (1)')
  for (const query of ['PR出しました', 'alice']) {
    await input.setValue(query)
    expect(wrapper.get('h3').text()).toBe('アクティブ (0)')
    expect(wrapper.text()).toContain('一致するスレッドがありません')
    expect(
      wrapper.findComponent(ChannelThreadsSidebarThreadCard).exists()
    ).toBe(false)
    expect(wrapper.find('button').exists()).toBe(true)
  }
  await input.setValue('  ')
  expect(wrapper.get('h3').text()).toBe('アクティブ (5)')
})

test('ignores case and surrounding whitespace in the search', async () => {
  const items = mockThreads
    .getMockThreadItems()
    .slice(0, 1)
    .map(item => ({
      ...item,
      thread: { ...item.thread, name: 'Planning Notes' }
    }))
  vi.spyOn(mockThreads, 'getMockThreadItems').mockReturnValueOnce(items)
  const wrapper = mountList()
  await wrapper.get('input').setValue('  pLANNING  ')
  expect(wrapper.get('h3').text()).toBe('アクティブ (1)')
  expect(
    wrapper.getComponent(ChannelThreadsSidebarThreadCard).props('title')
  ).toBe('Planning Notes')
})

test('resets filters and updates link targets when the channel changes', async () => {
  const wrapper = mountList()
  await wrapper.get('input').setValue('相談')
  await wrapper.get('button').trigger('click')
  await wrapper.setProps({ channelId: 'random' })
  expect(wrapper.get('input').element.value).toBe('')
  expect(wrapper.get('button').attributes('aria-pressed')).toBe('false')
  expect(wrapper.get('h3').text()).toBe('アクティブ (5)')
  for (const card of wrapper.findAllComponents(
    ChannelThreadsSidebarThreadCard
  )) {
    expect(card.props('to')).toMatch(/^\/channels\/random\//)
  }
})

test('keeps the controls and a zero count when the selected state has no threads', async () => {
  vi.spyOn(mockThreads, 'getMockThreadItems').mockReturnValueOnce([])
  const wrapper = mountList()
  expect(wrapper.get('h3').text()).toBe('アクティブ (0)')
  expect(wrapper.text()).toContain('アクティブなスレッドがありません')
  await wrapper.get('button').trigger('click')
  expect(wrapper.get('h3').text()).toBe('アーカイブ済み (0)')
  expect(wrapper.text()).toContain('アーカイブ済みのスレッドがありません')
  expect(wrapper.find('input').exists()).toBe(true)
})
