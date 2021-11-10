<template>
  <div :class="$style.container" :title="title" :aria-disabled="disabled">
    <a-icon :class="$style.icon" :mdi="iconMdi" :name="iconName" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import AIcon from '/@/components/UI/AIcon.vue'

export default defineComponent({
  name: 'IconButton',
  components: {
    AIcon
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
