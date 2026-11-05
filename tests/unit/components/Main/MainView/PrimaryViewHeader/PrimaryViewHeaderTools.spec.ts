import { nextTick } from 'vue'

import { mount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'

import boolAttr from '/@/bool-attr'
import ChannelHeaderTools from '/@/components/Main/MainView/ChannelView/ChannelHeader/ChannelHeaderTools.vue'
import useChannelState from '/@/components/Main/MainView/ChannelView/ChannelHeader/composables/useChannelState'
import ThreadHeaderTools from '/@/components/Main/MainView/ThreadView/ThreadHeader/ThreadHeaderTools.vue'
import ThreadHeaderToolsMenu from '/@/components/Main/MainView/ThreadView/ThreadHeader/ThreadHeaderToolsMenu.vue'
import { useQall } from '/@/composables/qall/useQall'
import useChannelSubscriptionState from '/@/composables/subscription/useChannelSubscriptionState'
import useResponsive from '/@/composables/useResponsive'
import apis from '/@/lib/apis'

vi.mock('/@/composables/useResponsive', async () => {
  const { ref } = await import('vue')
  const isMobile = ref(false)
  return { default: () => ({ isMobile }) }
})
vi.mock('/@/store/ui/mainView', async () => {
  const { ref } = await import('vue')
  return { useMainViewStore: () => ({ headerStyle: ref('default') }) }
})
vi.mock('/@/store/ui/modal', async () => {
  const { ref } = await import('vue')
  return { useModalStore: () => ({ shouldShowModal: ref(false) }) }
})
vi.mock('/@/composables/qall/useQall', async () => {
  const { ref } = await import('vue')
  const state = { joinQall: vi.fn(), callingChannel: ref(undefined) }
  return { useQall: () => state }
})
vi.mock('/@/composables/subscription/useChannelSubscriptionState', async () => {
  const { ChannelSubscribeLevel } = await import('@traptitech/traq')
  const { ref } = await import('vue')
  const state = {
    currentChannelSubscription: ref(ChannelSubscribeLevel.none),
    changeToNextSubscriptionLevel: vi.fn()
  }
  return { default: () => state }
})
vi.mock(
  '/@/components/Main/MainView/ChannelView/ChannelHeader/composables/useChannelState',
  async () => {
    const { reactive } = await import('vue')
    const channelState = reactive({
      starred: false,
      forced: false,
      archived: false
    })
    return { default: () => ({ channelState }) }
  }
)
vi.mock(
  '/@/components/Main/MainView/ChannelView/ChannelHeader/ChannelHeaderToolsMenu.vue',
  () => ({
    default: {
      emits: ['clickItem'],
      template:
        '<button data-testid="channel-menu-item" @click="$emit(\'clickItem\')">チャンネル操作</button>'
    }
  })
)
vi.mock('/@/lib/apis', () => ({
  default: {
    addMyStar: vi.fn().mockResolvedValue(undefined),
    removeMyStar: vi.fn().mockResolvedValue(undefined)
  }
}))

const { isMobile } = useResponsive()
const { channelState } = useChannelState({ channelId: 'channel-a' })
const wrappers: VueWrapper[] = []
const global = { plugins: [boolAttr], stubs: { AIcon: true } }

const mountChannelTools = () => {
  const wrapper = mount(ChannelHeaderTools, {
    props: { channelId: 'channel-a' },
    attachTo: document.body,
    global
  })
  wrappers.push(wrapper)
  return wrapper
}

beforeEach(() => {
  vi.clearAllMocks()
  isMobile.value = false
  channelState.starred = false
  channelState.forced = false
})
afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.unmount())
  document.body.innerHTML = ''
})

describe('ChannelHeaderTools integration', () => {
  it('keeps channel notification and favorite operations connected to their handlers', async () => {
    const wrapper = mountChannelTools()
    const { changeToNextSubscriptionLevel } = useChannelSubscriptionState(
      () => 'channel-a'
    )
    await wrapper.get('[aria-label="未購読チャンネル"]').trigger('click')
    expect(changeToNextSubscriptionLevel).toHaveBeenCalledOnce()

    await wrapper.get('[aria-label="お気に入りに追加する"]').trigger('click')
    expect(apis.addMyStar).toHaveBeenCalledWith({ channelId: 'channel-a' })

    channelState.starred = true
    await nextTick()
    await wrapper.get('[aria-label="お気に入りから外す"]').trigger('click')
    expect(apis.removeMyStar).toHaveBeenCalledWith('channel-a')

    await wrapper.setProps({ channelId: 'channel-b' })
    await wrapper.get('[aria-label="お気に入りから外す"]').trigger('click')
    expect(apis.removeMyStar).toHaveBeenLastCalledWith('channel-b')
  })

  it('keeps forced channel notifications disabled', async () => {
    channelState.forced = true
    const wrapper = mountChannelTools()
    const { changeToNextSubscriptionLevel } = useChannelSubscriptionState(
      () => 'channel-a'
    )
    await wrapper.get('[aria-label="強制通知チャンネル"]').trigger('click')
    await wrapper
      .get('[aria-label="強制通知チャンネル"]')
      .trigger('keydown', { key: 'Enter' })
    expect(changeToNextSubscriptionLevel).not.toHaveBeenCalled()
  })

  it('keeps Qall and the channel menu in their slots', async () => {
    const wrapper = mountChannelTools()
    await wrapper.get('[title="Qallボタン"]').trigger('click')
    expect(useQall().joinQall).toHaveBeenCalledWith('channel-a')

    await wrapper.get('[aria-label="その他"]').trigger('click')
    await wrapper.get('[data-testid="channel-menu-item"]').trigger('click')
    expect(wrapper.find('[data-testid="channel-menu-item"]').exists()).toBe(
      false
    )

    isMobile.value = true
    await nextTick()
    expect(wrapper.find('[title="Qallボタン"]').exists()).toBe(false)
    expect(wrapper.findAll('[role="button"]')).toHaveLength(2)
  })
})

describe('ThreadHeaderTools integration', () => {
  it('shows only notification and more for threads on desktop and mobile', async () => {
    const wrapper = mount(ThreadHeaderTools, {
      attachTo: document.body,
      global
    })
    wrappers.push(wrapper)
    await wrapper
      .get('[aria-label="チャンネルの通知設定を引き継ぐ"]')
      .trigger('click')
    expect(wrapper.find('[aria-label="なし"]').exists()).toBe(true)

    for (const mobile of [false, true]) {
      isMobile.value = mobile
      await nextTick()
      expect(wrapper.findAll('[role="button"]')).toHaveLength(2)
      expect(wrapper.find('[aria-pressed]').exists()).toBe(false)
      await wrapper.get('[aria-label="その他"]').trigger('click')
      const items = wrapper.findAll('[role="menuitem"]')
      expect(items.map(item => item.text())).toEqual([
        '通知設定',
        'スレッドリンクをコピー',
        '名前を変更',
        'アーカイブ'
      ])
      await items[0]?.trigger('click')
      expect(wrapper.find('[role="menu"]').exists()).toBe(false)
    }
    expect(wrapper.emitted('clickMore')).toHaveLength(2)
    expect(apis.addMyStar).not.toHaveBeenCalled()
    expect(apis.removeMyStar).not.toHaveBeenCalled()
  })
})

describe('ThreadHeaderToolsMenu', () => {
  it('shows the design items and respects search and archive display states', async () => {
    const wrapper = mount(ThreadHeaderToolsMenu, {
      attachTo: document.body,
      global
    })
    wrappers.push(wrapper)
    expect(
      wrapper.findAll('[role="menuitem"]').map(item => item.text())
    ).toEqual([
      '通知設定',
      'スレッド内検索',
      'スレッドリンクをコピー',
      '名前を変更',
      'アーカイブ'
    ])
    expect(document.activeElement).toBe(
      wrapper.get('[role="menuitem"]').element
    )

    await wrapper.setProps({ showSearch: false, isArchived: true })
    expect(wrapper.text()).not.toContain('スレッド内検索')
    expect(wrapper.text()).toContain('アーカイブ解除')

    await wrapper.setProps({ isParentArchived: true })
    expect(wrapper.text()).not.toContain('アーカイブ')
    await wrapper.get('[role="menuitem"]').trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('clickItem')).toHaveLength(1)
  })
})
