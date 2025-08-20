<template>
  <button :class="$style.button">
    <a-icon name="pencil" mdi :size="iconSize" :class="$style.icon" />
  </button>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import AIcon from '/@/components/UI/AIcon.vue'
import { useResponsiveStore } from '/@/store/ui/responsive'

const { isMobile } = useResponsiveStore()

const iconSize = computed(() => (isMobile.value ? 20 : 24))
const buttonSize = computed(() => iconSize.value + (isMobile.value ? 4 : 8))
</script>

<style lang="scss" module>
.button {
  @include color-ui-secondary;
  @include background-primary;
  background-color: transparent;
  border: solid $theme-ui-secondary-default;
  opacity: 0.5;
  &:hover {
    opacity: 1;
  }
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
