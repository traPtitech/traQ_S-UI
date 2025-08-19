<template>
  <button :class="$style.button">
    <a-icon
      name="pencil"
      :mdi="iconMdi"
      :size="iconSize"
      :class="$style.icon"
    />
  </button>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import AIcon from '/@/components/UI/AIcon.vue'
import { useResponsiveStore } from '/@/store/ui/responsive'

const props = withDefaults(
  defineProps<{
    title?: string
    borderWidth?: number
    iconWidth?: number
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

const iconSize = computed(() =>
(isMobile.value ? 20 : 24))
const buttonSize = computed(() =>
iconSize.value + (isMobile.value ? 4 : 8))
</script>

<style lang="scss" module>
.button {
  @include color-ui-secondary;
  @include background-primary;
  padding: 4px 4px;
  border-radius: 50%;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  width: v-bind('`${buttonSize}px`');
  height: v-bind('`${buttonSize}px`');
}

.icon {
  @include color-ui-secondary;
  vertical-align: bottom;
}
</style>
