<template>
  <div :class="$style.spinnerContainer" :data-color="color">
    <div :class="$style.spinner" />
  </div>
</template>

<script lang="ts">
type SpinnerColor = 'white' | 'ui-secondary'
const defaultSpinnerColor: SpinnerColor = 'white'
</script>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    color?: SpinnerColor
  }>(),
  {
    color: defaultSpinnerColor
  }
)
</script>

<style lang="scss" module>
$size: 1.75em;
$spinner-width: 0.35em;

.spinnerContainer {
  display: flex;
  justify-content: center;
  align-items: center;
  &[data-color='white'] {
    --spinner-color: rgba(255, 255, 255);
    --spinner-gap-color: rgba(255, 255, 255, 0.25);
  }
  &[data-color='ui-secondary'] {
    --spinner-color: #{$theme-ui-secondary-default};
    --spinner-gap-color: var(--specific-loading-spinner-gap-ui-secondary);
  }
}
.spinner {
  position: relative;
  height: $size;
  width: $size;
  border: solid $spinner-width var(--spinner-color);
  border-right: solid $spinner-width var(--spinner-gap-color);
  border-radius: 50%;
  animation: spinner 1s infinite linear;
  &::before {
    content: '';
    position: absolute;
    top: -$spinner-width;
    left: -$spinner-width;
    bottom: 0;
    right: 0;
    display: block;
    height: $size;
    width: $size;
    border: solid $spinner-width var(--spinner-color);
    border-right: solid $spinner-width var(--spinner-gap-color);
    border-radius: 50%;
    transform: rotate(60deg);
  }
}

@keyframes spinner {
  0% {
    transform: rotate(0turn);
  }
  100% {
    transform: rotate(1turn);
  }
}
</style>
