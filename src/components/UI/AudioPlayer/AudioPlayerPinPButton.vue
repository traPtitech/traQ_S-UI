<template>
  <div v-if="canUsePinP" :class="$style.container" :aria-disabled="isPinPShown">
    <icon mdi name="picture-in-picture-bottom-right" :size="size" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Icon from '@/components/UI/Icon.vue'
import { checkPinPSupport, isSafari } from '@/lib/util/browser'

const safariFlag = isSafari()
const canUsePinP = checkPinPSupport() && !safariFlag

export default defineComponent({
  name: 'AudioPlayerPinPButton',
  components: {
    Icon
  },
  props: {
    isPinPShown: {
      type: Boolean,
      required: true
    },
    size: {
      type: Number,
      required: true
    }
  },
  setup() {
    return { canUsePinP }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  align-items: center;
  cursor: pointer;
}
</style>
