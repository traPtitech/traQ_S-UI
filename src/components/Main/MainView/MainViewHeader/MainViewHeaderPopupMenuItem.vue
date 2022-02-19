<template>
  <div
    :class="$style.container"
    :data-is-disabled="$boolAttr(disabled)"
    @click="onClick"
  >
    <a-icon
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
import AIcon from '/@/components/UI/AIcon.vue'

export default defineComponent({
  name: 'MainViewHeaderPopupMenuItem',
  components: {
    AIcon
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
    @include color-ui-primary-inactive;
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
