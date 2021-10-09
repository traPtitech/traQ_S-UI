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
import { defineComponent } from 'vue'
import AudioPlayerAbstractButton from './AudioPlayerAbstractButton.vue'
import { checkPinPSupport, isSafari } from '/@/lib/dom/browser'

const safariFlag = isSafari()
const canUsePinP = checkPinPSupport() && !safariFlag

export default defineComponent({
  name: 'AudioPlayerPinPButton',
  components: {
    AudioPlayerAbstractButton
  },
  props: {
    isPinPShown: {
      type: Boolean,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    return { canUsePinP }
  }
})
</script>
