<template>
  <button :class="$style.button">
    <AIcon name="pencil" mdi :size="iconSize" :class="$style.icon" />
  </button>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import AIcon from '/@/components/UI/AIcon.vue'
import { useResponsiveStore } from '/@/store/ui/responsive'

const { isMobile } = useResponsiveStore()
const props = defineProps<{
  size: number
}>()

const iconSize = computed(() => props.size - (isMobile.value ? 4 : 8))
</script>

<style lang="scss" module>
.button {
  @include color-ui-secondary;
  border: 2px solid $theme-ui-secondary-default;
  opacity: 0.5;
  &:hover {
    opacity: 1;
  }
  padding: 4px;
  border-radius: 50%;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  width: v-bind('`${$props.size}px`');
  height: v-bind('`${$props.size}px`');
}

.icon {
  @include color-ui-secondary;
  vertical-align: bottom;
}
</style>
