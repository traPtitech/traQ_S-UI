<template>
  <button
    ref="trigger"
    type="button"
    aria-haspopup="true"
    :aria-expanded="isOpen"
    :aria-controls="popupId"
    title="関連チャンネルを表示"
    :class="$style.trigger"
    @click="toggle"
  >
    <a-icon :size="20" name="rounded-triangle" :class="$style.icon" />
  </button>
  <!-- NOTE: ボタンから Tab 移動した際に popup のはじめに飛べるように Focus を管理する -->
  <div v-if="isOpen" ref="focusPopupRef" tabindex="0" @focus="focusPopup" />
  <channel-header-relation-popup
    v-if="isOpen"
    ref="popup"
    :popup-id="popupId"
    :right-position="triggerBottomRightPosition"
    :channel-id="props.channelId"
    @outside-click="close"
    @focus-return="focusTrigger"
  />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import AIcon from '/@/components/UI/AIcon.vue'
import ChannelHeaderRelationPopup from './ChannelHeaderRelationPopup.vue'
import { reactive } from 'vue'
import type { Point } from '/@/lib/basic/point'
import { randomString } from '/@/lib/basic/randomString'

const props = defineProps<{
  channelId: string
}>()

const trigger = ref<HTMLElement | null>(null)
const focusPopupRef = ref<HTMLElement | null>(null)
const popup = ref<InstanceType<typeof ChannelHeaderRelationPopup> | null>(null)

const popupId = randomString()

const isOpen = ref(false)
const toggle = () => {
  updateTriggerPosition()

  isOpen.value = !isOpen.value
}
const close = (e: Event) => {
  // NOTE: popup の外側かつボタンをクリックしたときに、うまく閉じないため抑制する
  //       具体的には close -> toggle と呼ばれて閉じなくなる
  if (trigger.value !== null && e.composedPath().includes(trigger.value)) return

  isOpen.value = false
}

const triggerBottomRightPosition = reactive<Point>({
  x: 0,
  y: 0
})
const updateTriggerPosition = () => {
  if (trigger.value === null) return

  const rect = trigger.value.getBoundingClientRect()
  triggerBottomRightPosition.x = rect.right
  triggerBottomRightPosition.y = rect.bottom
}

onMounted(() => {
  updateTriggerPosition()
  window.addEventListener('resize', updateTriggerPosition)
})
onUnmounted(() => {
  window.removeEventListener('resize', updateTriggerPosition)
})

const focusPopup = () => {
  popup.value?.focus()
}
const focusTrigger = () => {
  trigger.value?.focus()
}
</script>

<style lang="scss" module>
.trigger {
  @include color-ui-secondary;
  @include background-primary;

  cursor: pointer;
  overflow: hidden;
  height: 24px;
  width: 24px;
  margin: 0 8px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  position: sticky;
  right: 0;

  transition: transform 0.1s;

  &:hover {
    transform: scale(1.1);
  }

  .icon {
    transition: transform 0.5s;
  }

  &[aria-expanded='true'] .icon {
    transform: rotate(180deg);
  }
}
</style>
