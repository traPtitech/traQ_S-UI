<template>
  <audio-player-abstract-button
    v-if="canUsePinP"
    :disabled="isPinPShown || disabled"
    icon-name="picture-in-picture-bottom-right"
    icon-mdi
    :size="size"
    title="ピクチャーインピクチャー表示"
  />
</template>

<script lang="ts">
import { checkPinPSupport, isSafari } from '/@/lib/dom/browser'

const safariFlag = isSafari()
const canUsePinP = checkPinPSupport() && !safariFlag
</script>

<script lang="ts" setup>
import AudioPlayerAbstractButton from './AudioPlayerAbstractButton.vue'

withDefaults(
  defineProps<{
    isPinPShown: boolean
    size: number
    disabled?: boolean
  }>(),
  {
    disabled: false
  }
)
</script>
