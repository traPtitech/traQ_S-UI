<template>
  <button
    :class="$style.container"
    :disabled="disabled"
    :data-type="type"
    :type="isSubmit ? 'submit' : 'button'"
  >
    <a-icon
      v-if="iconName"
      :class="$style.icon"
      :name="iconName"
      :mdi="iconMdi"
    />
    {{ label }}
  </button>
</template>

<script lang="ts" setup>
import AIcon from '/@/components/UI/AIcon.vue'

type Type = 'primary' | 'secondary'

withDefaults(
  defineProps<{
    type: Type
    label?: string
    iconName?: string
    iconMdi?: boolean
    disabled?: boolean
    isSubmit?: boolean
  }>(),
  {
    label: '',
    iconMdi: false,
    disabled: false,
    isSubmit: false
  }
)
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
    border-color: $theme-accent-primary-default;
  }
  &[data-type='secondary'] {
    @include color-ui-secondary;
    @include background-primary;
    padding: 12px;
    border-color: $theme-ui-secondary-default;
  }
  &[disabled] {
    cursor: not-allowed;
  }
}
.icon {
  margin-right: 12px;
}
</style>
