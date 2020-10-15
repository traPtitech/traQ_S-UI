<template>
  <icon-button
    :class="$style.container"
    title="ファイルを添付する"
    icon-mdi
    icon-name="plus-circle-outline"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import IconButton from '@/components/UI/IconButton.vue'

export default defineComponent({
  name: 'MessageInputUploadButton',
  components: {
    IconButton
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-secondary;
  transform: scale(1);
  transition: transform 0.1s;
  &:hover {
    transform: scale(1.1);
  }
}
</style>
