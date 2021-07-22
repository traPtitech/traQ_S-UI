<template>
  <icon-button
    :class="$style.container"
    title="スタンプを挿入"
    icon-mdi
    icon-name="emoticon-outline"
    :disabled="disabled"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import IconButton from '/@/components/UI/IconButton.vue'

export default defineComponent({
  name: 'MessageInputInsertStampButton',
  components: {
    IconButton
  },
  props: {
    disabled: {
      type: Boolean,
      default: false
    }
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-secondary;
  transform: scale(1);
  transition: transform 0.1s;
  &[aria-disabled='false']:hover {
    transform: scale(1.1);
  }
  &[aria-disabled='true'] {
    opacity: 0.5;
  }
}
</style>
