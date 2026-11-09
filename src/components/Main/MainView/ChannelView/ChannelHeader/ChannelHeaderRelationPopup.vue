<template>
  <teleport to="#popup-header-relation">
    <ClickOutside @click-outside="e => emit('outside-click', e)">
      <div :id="props.popupId" :class="$style.popup" :style="positionStyle">
        <!-- NOTE: Popup から Shift + Tab で戻った際にトリガーのボタンに戻れるように Focus を管理する -->
        <div tabindex="0" @focus="emit('focus-return')" />
        <div
          role="tablist"
          :class="$style.tablist"
          @keydown.left="onKeydown"
          @keydown.right="onKeydown"
        >
          <ATab
            :id="siblingTabId"
            ref="siblingTab"
            :aria-selected="currentTab === 'siblings'"
            :aria-controls="siblingPanelId"
            :tabindex="currentTab === 'siblings' ? 0 : -1"
            label="兄弟チャンネル"
            @click="currentTab = 'siblings'"
          />
          <ATab
            :id="childrenTabId"
            ref="childrenTab"
            :aria-selected="currentTab === 'children'"
            :aria-controls="childrenPanelId"
            :tabindex="currentTab === 'children' ? 0 : -1"
            label="子チャンネル"
            @click="currentTab = 'children'"
          />
        </div>
        <ChannelHeaderRelationPanel
          :id="siblingPanelId"
          role="tabpanel"
          :aria-labelledby="siblingTabId"
          :channels="formattedSiblings"
          empty-message="兄弟チャンネルはありません"
          :hidden="currentTab !== 'siblings'"
        />
        <ChannelHeaderRelationPanel
          :id="childrenPanelId"
          role="tabpanel"
          :aria-labelledby="childrenTabId"
          :channels="formattedChildren"
          empty-message="子チャンネルはありません"
          :hidden="currentTab !== 'children'"
        />
      </div>
    </ClickOutside>
  </teleport>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, useId } from 'vue'
import type { Ref } from 'vue'

import ATab from '/@/components/UI/ATab.vue'
import ClickOutside from '/@/components/UI/ClickOutside'
import useRelatedChannels from '/@/composables/useRelatedChannels'
import { safeMod } from '/@/lib/basic/arithmetic'
import type { Point } from '/@/lib/basic/point'

import ChannelHeaderRelationPanel from './ChannelHeaderRelationPanel.vue'

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

const siblingTabId = useId()
const childrenTabId = useId()

const siblingPanelId = useId()
const childrenPanelId = useId()

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

  nextIndex = safeMod(nextIndex, tabNames.length)

  currentTab.value = tabNames[nextIndex] ?? currentTab.value
  tabNameRefs[currentTab.value].value?.focus()
}

const emit = defineEmits<{
  (e: 'outside-click', event: Event): void
  (e: 'focus-return'): void
}>()

const positionStyle = computed(() => ({
  '--anchor-right': `${props.rightPosition.x}px`,
  '--anchor-bottom': `${props.rightPosition.y}px`
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
  --viewport-margin: 16px;
  @include background-primary;
  @include drop-shadow-default;
  border-radius: 8px;

  position: fixed;
  top: calc(var(--anchor-bottom) + 8px);
  left: 0;
  width: max-content;
  padding: 16px 12px;
  max-width: calc(100% - var(--viewport-margin) * 2);
  transform: translateX(
    max(
      var(--viewport-margin),
      min(var(--anchor-right), 100vw - var(--viewport-margin)) - 100%
    )
  );
  overflow: hidden;
}

.tablist {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
</style>
