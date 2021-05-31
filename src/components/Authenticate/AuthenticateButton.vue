<template>
  <button
    :class="$style.container"
    :disabled="disabled"
    :data-type="type"
    :type="isSubmit ? 'submit' : 'button'"
  >
    <icon
      v-if="iconName"
      :class="$style.icon"
      :name="iconName"
      :mdi="iconMdi"
    />
    {{ label }}
  </button>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import Icon from '@/components/UI/Icon.vue'

type Type = 'primary' | 'secondary'

export default defineComponent({
  name: 'AuthenticateButton',
  components: {
    Icon
  },
  props: {
    type: {
      type: String as PropType<Type>,
      required: true
    },
    label: {
      type: String,
      default: ''
    },
    iconName: String,
    iconMdi: { type: Boolean, default: false },
    disabled: {
      type: Boolean,
      default: false
    },
    isSubmit: {
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
  display: flex;
  align-items: center;
  justify-content: center;
  border: {
    style: solid;
    width: 2px;
    radius: 4px;
  }
  font-weight: bold;
  cursor: pointer;
  &[data-type='primary'] {
    @include background-accent-primary;
    padding: 12px 64px;
    color: white;
    border-color: $theme-accent-primary;
  }
  &[data-type='secondary'] {
    @include color-ui-secondary;
    @include background-primary;
    padding: 12px;
    border-color: $theme-ui-secondary;
  }
  &[disabled] {
    cursor: not-allowed;
  }
}
.icon {
  margin-right: 12px;
}
</style>
