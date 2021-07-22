<template>
  <div :class="$style.container" :title="title" :aria-disabled="disabled">
    <icon :class="$style.icon" :mdi="iconMdi" :name="iconName" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Icon from '/@/components/UI/Icon.vue'

export default defineComponent({
  name: 'IconButton',
  components: {
    Icon
  },
  props: {
    iconName: {
      type: String,
      required: true
    },
    iconMdi: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: undefined
    },
    disabled: {
      type: Boolean,
      default: false
    }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
}
.icon {
  cursor: pointer;
  .container[aria-disabled='true'] & {
    cursor: not-allowed;
  }
}
</style>
