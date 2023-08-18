<template>
  <teleport to="#popup-header-relation">
    <click-outside @click-outside="e => emit('outside-click', e)">
      <div
        :id="props.popupId"
        ref="popupWrap"
        :class="$style.popup"
        :style="positionStyle"
      >
        <div role="tablist" :class="$style.tablist">
          <a-tab
            :id="siblingTabId"
            ref="siblingTab"
            role="tab"
            :aria-selected="currentTab === 'siblings'"
            :aria-controls="siblingPanelId"
            :tabindex="currentTab === 'siblings' ? 0 : -1"
            label="兄弟チャンネル"
            @click="currentTab = 'siblings'"
          />
          <a-tab
            :id="childrenTabId"
            role="tab"
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
import useRelatedChannels from '../ChannelSidebar/composables/useRelatedChannels'
import { randomString } from '/@/lib/basic/randomString'
import ATab from '/@/components/UI/ATab.vue'

interface Props {
  rightPosition: Point
  channelId: string
  popupId: string
}
const props = defineProps<Props>()

const siblingTab = ref<InstanceType<typeof ATab> | null>(null)
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

const isExpanded = ref(false)
const expand = () => {
  isExpanded.value = true
}
const collapse = () => {
  isExpanded.value = false
}

const currentTab = ref<'siblings' | 'children'>('siblings')

const emit = defineEmits<{
  (e: 'outside-click', event: Event): void
}>()

const popupWrap = ref<HTMLDivElement | null>(null)
const { width } = useBoxSize(popupWrap)

const positionStyle = computed(() => ({
  '--x': `${props.rightPosition.x - (width.value ?? 0)}px`,
  '--y': `${props.rightPosition.y}px`
}))
</script>

<style lang="scss" module>
.popup {
  @include background-primary;
  @include drop-shadow-default;
  border-radius: 4px;

  position: fixed;
  top: var(--y);
  left: max(16px, var(--x));
  margin-top: 8px;
  padding: 16px;
  // NOTE: 最大でも左右に 16px の余白を残す
  max-width: calc(100% - 16px * 2);
  overflow: hidden;
}

.tablist {
  display: grid;
  grid-template-columns: repeat(2, max-content);
  grid-gap: 8px;
  margin-bottom: 16px;
}
</style>
