<template>
  <button
    :class="$style.container"
    :data-react-hover="$boolAttr(reactHover)"
    :data-is-white="$boolAttr(isWhite)"
  >
    <div :class="$style.circle" :style="circleStyle" @click="emit('close')" />
    <span v-if="withText" :class="$style.text">閉じる</span>
  </button>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    withText?: boolean
    borderWidth?: number
    iconWidth?: number
    size: number
    innerSize?: number
    isWhite?: boolean
    reactHover?: boolean
  }>(),
  {
    withText: false,
    borderWidth: 2,
    iconWidth: 2,
    innerSize: 16,
    isWhite: false,
    reactHover: true
  }
)

const emit = defineEmits<{
  (e: 'close'): void
}>()

const circleStyle = computed(() => ({
  borderWidth: `${props.borderWidth}px`,
  width: `${props.size}px`,
  height: `${props.size}px`,
  '--innerSize': `${props.innerSize}px`,
  '--iconWidth': `${props.iconWidth}px`
}))
</script>

<style lang="scss" module>
.container {
  @include color-ui-secondary;
  @include size-body2;
  text-align: center;
  font-weight: bold;
  opacity: 0.5;
  &:hover,
  &:not([data-react-hover]) {
    opacity: 1;
  }
  &[data-is-white] {
    @include color-common-text-black;
  }
}

.circle {
  @include color-ui-secondary;
  position: relative;
  border: {
    style: solid;
    color: $theme-ui-secondary-default;
    radius: 50%;
  }
  cursor: pointer;
  &[data-is-white] {
    border-color: transparent;
    background-color: $common-text-white-primary;
  }
  &::before,
  &::after {
    content: '';
    display: block;
    width: var(--innerSize);
    height: var(--iconWidth);
    position: absolute;
    top: 50%;
    left: 50%;
    transform-origin: center;
    background: $theme-ui-secondary-background;
  }
  &::before {
    transform: translate(-50%, -50%) rotate(-45deg);
  }
  &::after {
    transform: translate(-50%, -50%) rotate(45deg);
  }
}

.text {
  display: block;
  margin-top: 8px;
}
</style>
