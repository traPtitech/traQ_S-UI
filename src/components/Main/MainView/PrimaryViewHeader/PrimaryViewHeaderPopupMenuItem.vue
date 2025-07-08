<template>
  <div
    :class="$style.container"
    :data-is-disabled="$boolAttr(disabled)"
    @click="onClick"
  >
    <a-icon :class="$style.icon" :name="iconName" :mdi="iconMdi" :size="24" />
    <span :class="$style.label">{{ label }}</span>
  </div>
</template>

<script lang="ts" setup>
import AIcon from '/@/components/UI/AIcon.vue'

const props = withDefaults(
  defineProps<{
    iconName: string
    iconMdi?: boolean
    label?: string
    disabled?: boolean
  }>(),
  {
    iconMdi: false,
    label: '',
    disabled: false
  }
)

const emit = defineEmits<{
  (e: 'click'): void
  (f: 'clickItem'): void
}>()

const onClick = () => {
  if (props.disabled) return
  emit('click')
  emit('clickItem')
}
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
