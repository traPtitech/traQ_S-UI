import type { Message } from '@traptitech/traq'

import { ref } from 'vue'

import { enableAutoUnmount, mount } from '@vue/test-utils'

import boolAttr from '/@/bool-attr'
import InformationSidebarPinnedMessage from '/@/components/Main/MainView/InformationSidebar/InformationSidebarPinned/InformationSidebarPinnedMessage.vue'

const threadsMap = ref(new Map([['thread', { archived: true }]]))
const channelsMap = ref(new Map([['channel', { archived: true }]]))
const removePinned = vi.fn()
vi.mock('/@/store/entities/threads', () => ({
  useThreadsStore: () => ({ threadsMap })
}))
vi.mock('/@/store/entities/channels', () => ({
  useChannelsStore: () => ({ channelsMap })
}))
vi.mock('/@/composables/useContextMenu', () => ({
  default: () => ({
    position: ref({ x: 0, y: 0 }),
    toggle: vi.fn(),
    close: vi.fn()
  })
}))
vi.mock('/@/composables/contextMenu/useCopyLink', () => ({
  default: () => ({ copyLink: vi.fn() })
}))
vi.mock('/@/composables/contextMenu/usePinToggler', () => ({
  default: () => ({ removePinned })
}))
enableAutoUnmount(afterEach)
beforeEach(() => {
  threadsMap.value.set('thread', { archived: true })
  removePinned.mockReset()
})
const message: Message = {
  id: 'message',
  channelId: 'thread',
  userId: 'author',
  content: 'pin',
  createdAt: '',
  updatedAt: '',
  pinned: true,
  stamps: [],
  threadId: null
}
const mountPin = (channelId = 'thread') =>
  mount(InformationSidebarPinnedMessage, {
    props: { message: { ...message, channelId } },
    global: {
      plugins: [boolAttr],
      stubs: {
        MessagePanel: true,
        ContextMenuContainer: { template: '<div><slot /></div>' }
      }
    }
  })

test('disables unpin for an archived thread and reacts to archive updates', async () => {
  const wrapper = mountPin()
  expect(wrapper.text()).not.toContain('ピン留めを外す')
  expect(wrapper.text()).toContain('リンクをコピー')
  threadsMap.value.set('thread', { archived: false })
  await wrapper.vm.$nextTick()
  const unpin = wrapper.findAll('span').find(s => s.text() === 'ピン留めを外す')
  if (!unpin) throw new Error('Unpin action missing')
  await unpin.trigger('click')
  expect(removePinned).toHaveBeenCalledTimes(1)
  threadsMap.value.set('thread', { archived: true })
  await wrapper.vm.$nextTick()
  expect(wrapper.text()).not.toContain('ピン留めを外す')
})

test('preserves the archived channel restriction', () => {
  const wrapper = mountPin('channel')
  expect(wrapper.text()).not.toContain('ピン留めを外す')
})
