<template>
  <button
    :class="$style.container"
    :title="title"
    :aria-pressed="modelValue"
    @click="toggle"
  >
    <icon :size="22" :class="$style.icon" :name="iconName" :mdi="iconMdi" />
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Icon from '/@/components/UI/Icon.vue'

export default defineComponent({
  name: 'ToggleButton',
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
    modelValue: {
      type: Boolean,
      default: false
    },
    title: String
  },
  emits: {
    'update:modelValue': (_value: boolean) => true
  },
  setup(props, { emit }) {
    const toggle = () => {
      emit('update:modelValue', !props.modelValue)
    }
    return { toggle }
  }
})
</script>

<style lang="scss" module>
.container {
  @include background-primary;
  padding: 4px 28px;
  border-radius: 4px;
  text-align: center;
  cursor: pointer;
}

.icon {
  @include color-ui-secondary;
  vertical-align: middle;
  opacity: 0.5;
  .container[aria-pressed='true'] & {
    @include color-accent-primary;
    opacity: 1;
  }
}
</style>
