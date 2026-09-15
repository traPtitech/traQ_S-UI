import { mount } from '@vue/test-utils'

import ChannelTree from '/@/components/Main/NavigationBar/ChannelList/ChannelTree.vue'

vi.mock('@tanstack/vue-virtual', async () => {
  const { shallowRef } = await import('vue')
  return {
    useVirtualizer: () =>
      shallowRef({
        getVirtualItems: () => [],
        getTotalSize: () => 1800,
        measureElement: () => undefined
      })
  }
})

vi.mock(
  '/@/components/Main/NavigationBar/ChannelList/ChannelElement.vue',
  () => ({ default: { template: '<div />' } })
)

describe('ChannelTree', () => {
  it('非表示中も仮想リストの高さを保持する', () => {
    const wrapper = mount(ChannelTree, {
      props: { channels: [], scrollElement: null }
    })

    const spacers = wrapper.findAll('[aria-hidden="true"]')
    expect(spacers).toHaveLength(2)
    expect(spacers[0]?.attributes('style')).toContain('height: 0px')
    expect(spacers[1]?.attributes('style')).toContain('height: 1800px')
  })
})
