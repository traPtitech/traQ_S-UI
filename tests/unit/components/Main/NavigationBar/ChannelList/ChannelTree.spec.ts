import type { VirtualItem } from '@tanstack/vue-virtual'
import { mount } from '@vue/test-utils'

import ChannelTree from '/@/components/Main/NavigationBar/ChannelList/ChannelTree.vue'
import type { ChannelId } from '/@/types/entity-ids'

const virtualizerMock = vi.hoisted(() => ({
  items: [] as VirtualItem[],
  measureElement: vi.fn()
}))

vi.mock('@tanstack/vue-virtual', async () => {
  const { shallowRef } = await import('vue')
  return {
    useVirtualizer: (options: { value: { scrollMargin: number } }) =>
      shallowRef({
        options: options.value,
        getVirtualItems: () => virtualizerMock.items,
        getTotalSize: () => 1800,
        measureElement: virtualizerMock.measureElement
      })
  }
})

vi.mock(
  '/@/components/Main/NavigationBar/ChannelList/ChannelElement.vue',
  () => ({ default: { template: '<div />' } })
)

describe('ChannelTree', () => {
  beforeEach(() => {
    virtualizerMock.items = []
    virtualizerMock.measureElement.mockClear()
  })

  it('非表示中も仮想リストの高さを保持する', () => {
    const wrapper = mount(ChannelTree, {
      props: { channels: [], scrollElement: null }
    })

    expect(wrapper.element.style.paddingTop).toBe('0px')
    expect(wrapper.element.style.paddingBottom).toBe('1800px')
    expect(wrapper.element.children).toHaveLength(0)
    wrapper.unmount()
  })

  it.each([false, true])(
    '仮想行の前後の余白を保持し、トピック表示が %s の場合だけ高さを監視する',
    showTopic => {
      const channels = Array.from({ length: 50 }, (_, index) => ({
        id: String(index) as ChannelId,
        name: String(index),
        children: [],
        active: true,
        archived: false
      }))

      virtualizerMock.items = [10, 11].map(index => ({
        index,
        key: `/${index}`,
        start: 28 + index * 36,
        end: 28 + (index + 1) * 36,
        size: 36,
        lane: 0
      }))

      const wrapper = mount(ChannelTree, {
        props: { channels, scrollElement: null, scrollMargin: 28, showTopic }
      })

      expect(wrapper.element.style.paddingTop).toBe('360px')
      expect(wrapper.element.style.paddingBottom).toBe('1368px')
      expect(wrapper.findAll('[data-key]')).toHaveLength(2)
      expect(virtualizerMock.measureElement).toHaveBeenCalledTimes(
        showTopic ? 2 : 0
      )

      wrapper.unmount()
    }
  )
})
