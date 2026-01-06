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
    <div :class="$style.iconContainer">
      <AIcon :size="20" name="rounded-triangle" :class="$style.icon" />
    </div>
  </button>
  <!-- NOTE: ボタンから Tab 移動した際に popup のはじめに飛べるように Focus を管理する -->
  <div v-if="isOpen" tabindex="0" @focus="focusPopup" />
  <ChannelHeaderRelationPopup
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
import { computed, onMounted, reactive, ref } from 'vue'

import { useEventListener } from '@vueuse/core'

import AIcon from '/@/components/UI/AIcon.vue'
import type { Point } from '/@/lib/basic/point'
import { randomString } from '/@/lib/basic/randomString'

import ChannelHeaderRelationPopup from './ChannelHeaderRelationPopup.vue'

const props = defineProps<{
  channelId: string
}>()

const trigger = ref<HTMLElement | null>(null)
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

useEventListener(
  computed(() => (isOpen.value ? window : null)),
  'resize',
  updateTriggerPosition
)

onMounted(() => {
  updateTriggerPosition()
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

  cursor: pointer;
  overflow: hidden;
  height: auto;
  width: 24px;
  padding-inline: 24px 18px;
  place-items: center;
  flex-shrink: 0;
  position: sticky;
  right: -1px;

  background: linear-gradient(
    to right,
    transparent,
    var(--theme-background-primary-default) 30%
  );

  &[aria-expanded='true'] .icon {
    transform: rotate(180deg);
  }
}

.iconContainer {
  transition: transform 0.1s;

  &:hover {
    transform: scale(1.1);
  }

  .icon {
    margin-top: 12px;
    transition: transform 0.5s;
  }
}
</style>
