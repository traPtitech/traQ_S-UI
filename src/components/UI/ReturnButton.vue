<template>
  <a-icon :size="size" mdi name="chevron-left" :class="$style.button" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import AIcon from '/@/components/UI/AIcon.vue'

export default defineComponent({
  name: 'ReturnButton',
  components: {
    AIcon
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
