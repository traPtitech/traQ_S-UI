<template>
  <div v-if="show" :class="$style.container">
    + Enterを押して{{ sendWithModifierKey === 'modifier' ? sendText : '改行' }}
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useBrowserSettings } from '/@/store/app/browserSettings'

export default defineComponent({
  name: 'MessageInputKeyGuide',
  props: {
    show: {
      type: Boolean,
      required: true
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const { sendWithModifierKey } = useBrowserSettings()
    const sendText = computed(() => (props.isEdit ? '保存' : '送信'))

    return { sendWithModifierKey, sendText }
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
