<template>
  <div :class="$style.container">
    <a-icon :name="iconName" :mdi="iconMdi" :size="24" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import AIcon from '/@/components/UI/AIcon.vue'

export default defineComponent({
  name: 'ToolItem',
  components: { AIcon },
  props: {
    iconName: {
      type: String,
      required: true
    },
    iconMdi: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    return {}
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-secondary;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  cursor: pointer;
  opacity: 0.5;
  &:hover {
    opacity: 1;
  }
}
</style>
