<template>
  <IconButton
    :class="$style.container"
    title="スタンプを挿入"
    icon-mdi
    icon-name="emoticon-outline"
    :disabled="disabled"
    @mousedown.left.prevent
    @pointerdown="onPointerDown"
    @pointerup="onPointerUp"
    @pointercancel="touchPointerId = undefined"
    @click="onClick"
  />
</template>

<script lang="ts" setup>
import IconButton from '/@/components/UI/IconButton.vue'

const props = withDefaults(
  defineProps<{
    disabled?: boolean
  }>(),
  {
    disabled: false
  }
)

const emit = defineEmits<{
  (e: 'click', _event: MouseEvent): void
}>()

let touchPointerId: number | undefined
let ignoreNextClick = false

const onPointerDown = (event: PointerEvent) => {
  if (!event.isPrimary || event.button !== 0) return
  ignoreNextClick = false
  touchPointerId = event.pointerType === 'touch' ? event.pointerId : undefined
}

const onPointerUp = (event: PointerEvent) => {
  if (touchPointerId !== event.pointerId) return
  touchPointerId = undefined
  ignoreNextClick = true
  if (props.disabled) return

  const { left, right, top, bottom } = (
    event.currentTarget as HTMLElement
  ).getBoundingClientRect()
  if (
    event.clientX < left ||
    event.clientX > right ||
    event.clientY < top ||
    event.clientY > bottom
  ) {
    return
  }

  emit('click', event)
}

const onClick = (event: MouseEvent) => {
  const ignore = ignoreNextClick && event.detail !== 0
  ignoreNextClick = false
  if (!ignore && !props.disabled) emit('click', event)
}
</script>

<style lang="scss" module>
.container {
  @include color-ui-secondary;
  transform: scale(1);
  transition: transform 0.1s;
  &[aria-disabled='false']:hover {
    transform: scale(1.1);
  }
  &[aria-disabled='true'] {
    @include color-ui-secondary-inactive;
  }
}
</style>
