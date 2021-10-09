<template>
  <div
    :class="$style.container"
    :data-is-disabled="$boolAttr(disabled)"
    @click="onClick"
  >
    <icon
      :class="$style.icon"
      :name="iconName"
      :mdi="iconMdi"
      :width="24"
      :height="24"
    />
    <span :class="$style.label">{{ label }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Icon from '/@/components/UI/Icon.vue'

export default defineComponent({
  name: 'MainViewHeaderPopupMenuItem',
  components: {
    Icon
  },
  props: {
    iconName: { type: String, required: true },
    iconMdi: { type: Boolean, default: false },
    label: { type: String, default: '' },
    disabled: { type: Boolean, default: false }
  },
  emits: {
    click: () => true
  },
  setup(props, { emit }) {
    const onClick = () => {
      if (props.disabled) return
      emit('click')
    }
    return { onClick }
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-primary;
  display: flex;
  cursor: pointer;
  &[data-is-disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
.icon {
  flex-shrink: 0;
  margin-right: 12px;
}
.label {
  font: {
    size: 1rem;
  }
}
</style>
