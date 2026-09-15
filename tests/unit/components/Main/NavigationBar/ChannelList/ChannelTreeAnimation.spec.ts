import { mount } from '@vue/test-utils'

import ChannelTreeAnimation from '/@/components/Main/NavigationBar/ChannelList/ChannelTreeAnimation.vue'
import type { ChannelTreeAnimationState } from '/@/components/Main/NavigationBar/ChannelList/channelTreeAnimation'
import type { ChannelTreeNode } from '/@/lib/channelTree'
import type { ChannelId } from '/@/types/entity-ids'

vi.mock(
  '/@/components/Main/NavigationBar/ChannelList/ChannelElement.vue',
  () => ({ default: { template: '<div />' } })
)

const node: ChannelTreeNode = {
  id: 'child' as ChannelId,
  name: 'child',
  children: [],
  active: true,
  archived: false
}

const animation: ChannelTreeAnimationState = {
  id: 1,
  direction: 'expand',
  origin: 36,
  height: 36,
  trailingHeight: 0,
  rows: [
    {
      key: '/root/child',
      item: { node, depth: 1, key: '/root/child' },
      start: 0,
      isOpened: false
    }
  ],
  rowKeys: new Set(['/root/child']),
  movingRows: [],
  movingRowKeys: new Set()
}

describe('ChannelTreeAnimation', () => {
  it('操作対象から除外し、アニメーション終了を通知する', async () => {
    const wrapper = mount(ChannelTreeAnimation, {
      props: { animation }
    })

    expect(wrapper.attributes('inert')).toBe('')

    await wrapper.find('[data-direction="expand"]').trigger('animationend')

    expect(wrapper.emitted('finish')).toEqual([[animation.id]])
  })
})
