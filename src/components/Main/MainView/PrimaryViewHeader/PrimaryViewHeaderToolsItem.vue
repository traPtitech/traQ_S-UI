<template>
  <icon-button
    :class="$style.container"
    :data-is-disabled="$boolAttr(disabled)"
    :data-header-style="headerStyle"
    :title="tooltip"
    :icon-mdi="iconMdi"
    :icon-name="iconName"
    @click="onClick"
  />
</template>

<script lang="ts" setup>
import { useMainViewStore } from '/@/store/ui/mainView'
import IconButton from '/@/components/UI/IconButton.vue'

const props = withDefaults(
  defineProps<{
    iconName: string
    iconMdi?: boolean
    disabled?: boolean
    tooltip?: string
  }>(),
  {
    iconMdi: false,
    disabled: false
  }
)

const emit = defineEmits<{
  (e: 'click'): void
}>()

const { headerStyle } = useMainViewStore()
const onClick = () => {
  if (props.disabled) return
  emit('click')
}
</script>

<style lang="scss" module>
.container {
  @include color-ui-primary;
  padding: 8px;
  cursor: pointer;
  width: 40px;
  height: 40px;
  &[data-is-disabled] {
    @include color-ui-primary-inactive;
    cursor: not-allowed;
  }
  &[data-header-style='dark'] {
    @include color-common-text-white-primary;
  }
}
</style>
