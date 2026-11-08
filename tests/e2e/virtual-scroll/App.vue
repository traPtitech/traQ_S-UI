<template>
  <main :style="{ width: `${width}px` }">
    <div
      v-show="visible"
      :key="generation"
      data-testid="panel"
      :class="$style.panel"
    >
      <ChannelsTab v-if="view === 'channels'" data-testid="channels-scroll" />
      <HomeTab v-else-if="view === 'home'" data-testid="home-scroll" />
      <div
        v-else
        ref="scrollElement"
        data-testid="tree-scroll"
        :class="$style.scroller"
      >
        <div data-testid="tree-header" :style="{ height: `${headerHeight}px` }">
          Channels
        </div>
        <ChannelTree
          :channels="roots"
          :scroll-element="scrollElement"
          :scroll-margin="headerHeight"
          :show-topic="showTopics"
          show-shortened-path
        />
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'

import ChannelTree from '/@/components/Main/NavigationBar/ChannelList/ChannelTree.vue'
import ChannelsTab from '/@/components/Main/NavigationBar/NavigationContent/ChannelsTab.vue'
import HomeTab from '/@/components/Main/NavigationBar/NavigationContent/HomeTab.vue'
import { constructTreeFromIds } from '/@/lib/channelTree'
import { isWebKit } from '/@/lib/dom/browser'
import { renderInline } from '/@/lib/markdown/markdown'
import { resolveTheme } from '/@/lib/theme/resolve'
import { getThemeVariables } from '/@/lib/theme/variables'
import { useBrowserSettings } from '/@/store/app/browserSettings'
import { useMeStore } from '/@/store/domain/me'
import { useSubscriptionStore } from '/@/store/domain/subscription'
import { useChannelsStore } from '/@/store/entities/channels'
import { useGroupsStore } from '/@/store/entities/groups'
import { entityMitt } from '/@/store/entities/mitt'
import { useStampsStore } from '/@/store/entities/stamps'
import { useUsersStore } from '/@/store/entities/users'

import { createChannels, flatId } from './data'
import type { ChannelFixture } from './harness'

const theme = getThemeVariables(resolveTheme(window.defaultLightTheme))

for (const [property, value] of Object.entries(theme)) {
  document.documentElement.style.setProperty(property, value)
}

document.body.style.setProperty(
  '--contain-strict',
  isWebKit() ? 'inline-size layout paint style' : 'strict'
)

const channels = useChannelsStore()
channels.bothChannelsMapFetched.value = true

const settings = useBrowserSettings()
const subscription = useSubscriptionStore()
const me = useMeStore()

const generation = ref(0)
const view = ref<ChannelFixture['view']>('channels')
const width = ref(320)
const visible = ref(true)
const showTopics = ref(true)
const headerHeight = ref(100)
const scrollElement = ref<HTMLElement | null>(null)

const roots = computed(() =>
  constructTreeFromIds(
    [...channels.channelsMap.value.values()]
      .filter(c => c.parentId === null)
      .map(c => c.id),
    channels.channelsMap.value
  )
)

const ready = Promise.all([
  useUsersStore().fetchUsers(),
  useGroupsStore().fetchUserGroups(),
  useStampsStore().fetchStamps(),
  me.fetchMe()
]).then(async () => {
  // 実際の起動順に合わせ、チャンネル検索の前に Markdown レンダラーを初期化する。
  // 各トピックの非同期描画による高さの変化もテスト対象に含める。
  await renderInline('')
})

const setUnread = async (count: number) => {
  subscription.unreadChannelsMap.value = new Map(
    Array.from({ length: count }, (_, index) => {
      const id = flatId(index + 1)

      return [
        id,
        {
          channelId: id,
          count: 1,
          noticeable: index % 2 === 0,
          since: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
          oldestMessageId: 'message-id'
        }
      ]
    })
  )

  await nextTick()
}

window.virtualScrollHarness = {
  ready,

  async load(fixture = {}) {
    await ready

    const data = createChannels(fixture)
    channels.channelsMap.value = new Map(data.map(c => [c.id, c]))
    subscription.subscriptionMap.value = new Map(data.map(c => [c.id, 1]))

    settings.filterStarChannel.value = false
    settings.showArchivedChannels.value = false

    if (me.detail.value) {
      me.detail.value = { ...me.detail.value, homeChannel: data[0]?.id ?? null }
    }

    entityMitt.emit('setChannels')
    await setUnread(0)

    view.value = fixture.view ?? 'channels'
    showTopics.value = fixture.topics ?? true
    visible.value = true
    headerHeight.value = 100
    width.value = 320
    generation.value++

    await nextTick()
  },

  async setTopic(id, topic) {
    const channel = channels.channelsMap.value.get(id)
    if (!channel) throw new Error(`Unknown channel: ${id}`)

    channel.topic = topic
    await nextTick()
  },

  async setVisible(value) {
    visible.value = value
    await nextTick()
  },

  async setWidth(value) {
    width.value = value
    await nextTick()
  },

  async setHeaderHeight(value) {
    headerHeight.value = value
    await nextTick()
  },

  setUnread
}
</script>

<style lang="scss" module>
:global(html),
:global(body),
:global(#app) {
  height: 100%;
  overflow: hidden;
}

main {
  max-width: 100vw;
  padding: 12px;
  height: 100%;
  background: var(--theme-background-secondary-default);
}

.panel {
  height: min(600px, calc(100dvh - 24px));
  background: var(--theme-background-primary-default);
}

.scroller {
  height: 100%;
  overflow-y: auto;
  padding: 0 0 24px 8px;
  scrollbar-gutter: stable;
}
</style>
