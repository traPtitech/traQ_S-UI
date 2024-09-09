<template>
  <button :class="$style.button">
    <a-icon
      :name="iconName"
      :mdi="iconMdi"
      :size="isMobile ? 20 : 24"
      :class="$style.icon"
    />
    {{ title }}
  </button>
</template>

<script lang="ts" setup>
import AIcon from '/@/components/UI/AIcon.vue'
import { useResponsiveStore } from '/@/store/ui/responsive'

withDefaults(
  defineProps<{
    title?: string
    iconName: string
    iconMdi: boolean
  }>(),
  {
    title: ''
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
  gap: 4px;
}

.icon {
  @include color-ui-secondary;
  vertical-align: bottom;
}
</style>
