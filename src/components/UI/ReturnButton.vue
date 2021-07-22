<template>
  <icon :size="size" mdi name="chevron-left" :class="$style.button" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Icon from '/@/components/UI/Icon.vue'

export default defineComponent({
  name: 'ReturnButton',
  components: {
    Icon
  },
  props: {
    size: {
      type: Number,
      default: 24
    }
  }
})
</script>

<style lang="scss" module>
.button {
  cursor: pointer;
}
</style>
