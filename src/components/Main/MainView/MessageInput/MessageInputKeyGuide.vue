<template>
  <div v-if="show" :class="$style.container">
    + Enterを押して{{ sendWithModifierKey === 'modifier' ? '送信' : '改行' }}
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import store from '@/store'

export default defineComponent({
  name: 'MessageInputKeyGuide',
  props: {
    show: {
      type: Boolean,
      required: true
    }
  },
  setup() {
    const sendWithModifierKey = computed(
      () => store.state.app.browserSettings.sendWithModifierKey
    )

    return { sendWithModifierKey }
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-text-secondary;
  position: absolute;
  top: 0;
  right: 0;
  transform: translateY(-100%);
}
</style>
