<template>
  <icon-button
    :class="$style.container"
    title="プレビュー表示"
    icon-name="markdown"
    :data-is-enabled="modelValue"
    @click="toggle"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import IconButton from '/@/components/UI/IconButton.vue'

export default defineComponent({
  name: 'MessageInputPreviewButton',
  components: {
    IconButton
  },
  props: {
    modelValue: {
      type: Boolean,
      required: true
    }
  },
  emits: {
    'update:modelValue': (v: boolean) => true
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
  @include color-ui-secondary;
  transform: scale(1);
  transition: transform 0.1s;
  &:hover {
    transform: scale(1.1);
  }
  &[data-is-enabled='true'] {
    @include color-accent-primary;
  }
}
</style>
