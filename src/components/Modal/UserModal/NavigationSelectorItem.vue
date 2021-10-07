<template>
  <button :class="$style.item" :aria-selected="isSelected">
    <icon :name="iconName" :mdi="iconMdi" :size="24" />
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Icon from '/@/components/UI/Icon.vue'

export default defineComponent({
  name: 'NavigationSelectorItem',
  components: { Icon },
  props: {
    iconName: {
      type: String,
      required: true
    },
    iconMdi: Boolean,
    isSelected: {
      type: Boolean,
      required: true
    }
  },
  setup() {
    return {}
  }
})
</script>

<style lang="scss" module>
.item {
  @include color-ui-secondary;
  display: flex;
  box-sizing: content-box;
  margin: 4px 0;
  padding: 8px;
  border-left: 4px solid transparent;
  cursor: pointer;

  &[aria-selected='true'] {
    @include color-accent-primary;
    border-color: $theme-accent-primary;
  }
  &:not([aria-selected='true']):hover {
    border-color: $theme-ui-secondary;
  }
}
</style>
