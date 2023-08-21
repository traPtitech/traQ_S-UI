<template>
  <teleport to="#popup-header-relation">
    <click-outside @click-outside="e => emit('outside-click', e)">
      <div
        :id="props.popupId"
        ref="popupWrap"
        :class="$style.popup"
        :style="positionStyle"
      >
        <!-- NOTE: Popup から Shift + Tab で戻った際にトリガーのボタンに戻れるように Focus を管理する -->
        <div tabindex="0" @focus="emit('focus-return')" />
        <div
          role="tablist"
          :class="$style.tablist"
          @keydown.left="onKeydown"
          @keydown.right="onKeydown"
        >
          <a-tab
            :id="siblingTabId"
            ref="siblingTab"
            :aria-selected="currentTab === 'siblings'"
            :aria-controls="siblingPanelId"
            :tabindex="currentTab === 'siblings' ? 0 : -1"
            label="兄弟チャンネル"
            @click="currentTab = 'siblings'"
          />
          <a-tab
            :id="childrenTabId"
            ref="childrenTab"
            :aria-selected="currentTab === 'children'"
            :aria-controls="childrenPanelId"
            :tabindex="currentTab === 'children' ? 0 : -1"
            label="子チャンネル"
            @click="currentTab = 'children'"
          />
        </div>
        <channel-header-relation-panel
          :id="siblingPanelId"
          role="tabpanel"
          :aria-labelledby="siblingTabId"
          :channels="formattedSiblings"
          empty-message="兄弟チャンネルはありません"
          :hidden="currentTab !== 'siblings'"
        />
        <channel-header-relation-panel
          :id="childrenPanelId"
          role="tabpanel"
          :aria-labelledby="childrenTabId"
          :channels="formattedChildren"
          empty-message="子チャンネルはありません"
          :hidden="currentTab !== 'children'"
        />
      </div>
    </click-outside>
  </teleport>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import ClickOutside from '/@/components/UI/ClickOutside'
import ChannelHeaderRelationPanel from './ChannelHeaderRelationPanel.vue'
import type { Point } from '/@/lib/basic/point'
import useBoxSize from '/@/composables/dom/useBoxSize'
import useRelatedChannels from '/@/composables/useRelatedChannels'
import { randomString } from '/@/lib/basic/randomString'
import ATab from '/@/components/UI/ATab.vue'
import type { Ref } from 'vue'

interface Props {
  rightPosition: Point
  channelId: string
  popupId: string
}
const props = defineProps<Props>()

const siblingTab = ref<InstanceType<typeof ATab> | null>(null)
const childrenTab = ref<InstanceType<typeof ATab> | null>(null)
onMounted(() => {
  siblingTab.value?.focus()
})

const siblingTabId = randomString()
const childrenTabId = randomString()

const siblingPanelId = randomString()
const childrenPanelId = randomString()

const { children, siblings } = useRelatedChannels({
  channelId: props.channelId
})
const formattedChildren = computed(() => children.value ?? [])
const formattedSiblings = computed(() =>
  siblings.value.filter(s => s.id !== props.channelId)
)

const tabNames = ['siblings', 'children'] as const
const tabNameRefs: Record<
  (typeof tabNames)[number],
  Ref<InstanceType<typeof ATab> | null>
> = {
  siblings: siblingTab,
  children: childrenTab
}
const currentTab = ref<(typeof tabNames)[number]>('siblings')
const onKeydown = (e: KeyboardEvent) => {
  const index = tabNames.indexOf(currentTab.value)
  if (index === -1) return

  let nextIndex: number
  if (e.key === 'ArrowLeft') {
    nextIndex = index - 1
  } else if (e.key === 'ArrowRight') {
    nextIndex = index + 1
  } else {
    return
  }

  nextIndex = (nextIndex + tabNames.length) % tabNames.length

  currentTab.value = tabNames[nextIndex] ?? currentTab.value
  tabNameRefs[currentTab.value].value?.focus()
}

const emit = defineEmits<{
  (e: 'outside-click', event: Event): void
  (e: 'focus-return'): void
}>()

const popupWrap = ref<HTMLDivElement | null>(null)
const { width } = useBoxSize(popupWrap)

const positionStyle = computed(() => ({
  '--x': `${props.rightPosition.x - (width.value ?? 0)}px`,
  '--y': `${props.rightPosition.y}px`
}))

const focus = () => {
  if (currentTab.value === 'siblings') {
    siblingTab.value?.focus()
  } else {
    childrenTab.value?.focus()
  }
}
defineExpose({ focus })
</script>

<style lang="scss" module>
.popup {
  @include background-primary;
  @include drop-shadow-default;
  border-radius: 8px;

  position: fixed;
  top: calc(var(--y) + 8px);
  left: max(16px, var(--x));
  padding: 16px 12px;
  // NOTE: 最大でも左右に 16px の余白を残す
  max-width: calc(100% - 16px * 2);
  overflow: hidden;
}

.tablist {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
</style>
