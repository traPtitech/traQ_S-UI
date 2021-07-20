<template>
  <button
    :class="$style.container"
    :aria-selected="isActive"
    @click="emit('click')"
  >
    <icon name="effect" />
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Icon from '/@/components/UI/Icon.vue'

export default defineComponent({
  name: 'StampPickerEffectToggleButton',
  components: {
    Icon
  },
  props: {
    isActive: { type: Boolean, default: false }
  },
  setup(_, { emit }) {
    return { emit }
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-secondary;
  @include background-secondary;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 30px;
  border: {
    radius: 4px;
    width: 2px;
    style: solid;
    color: transparent;
  }
  opacity: 0.5;
  cursor: pointer;

  &[aria-selected='true'] {
    @include color-accent-primary;
    border-color: $theme-accent-primary;
  }
}
</style>
