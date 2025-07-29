<template>
  <button :class="$style.button">
    <a-icon
      :name="iconName"
      :mdi="iconMdi"
      :size="isMobile ? 16 : 24"
      :class="$style.icon"
    />
    {{ title }}
  </button>
</template>

<script lang="ts" setup>
import AIcon from '/@/components/UI/AIcon.vue'
import { useResponsiveStore } from '/@/store/ui/responsive'

const props = withDefaults(
  defineProps<{
    title?: string
    borderWidth?: number
    iconWidth?: number
    size: number
    innerSize?: number
    iconName: string
    iconMdi: boolean
  }>(),
  {
    title: '',
    borderWidth: 2,
    iconWidth: 2
  }
)

const { isMobile } = useResponsiveStore()
</script>

<style lang="scss" module>
.button {
  @include color-ui-secondary;
  @include background-primary;
  padding: 4px 12px;
  border-radius: 1em;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
}

.icon {
  @include color-ui-secondary;
  vertical-align: bottom;
}
</style>
