<template>
  <component
    :is="toast.onClick ? 'button' : 'div'"
    :type="toast.onClick ? 'button' : undefined"
    :class="$style.container"
    :data-type="toast.type"
    @click="onClick"
  >
    <AIcon :class="$style.icon" :name="iconName" mdi :size="32" />
    <span :class="$style.text">
      {{ toast.text }}
    </span>
  </component>
</template>

<script lang="ts" setup>
import { computed, watch } from 'vue'

import AIcon from '/@/components/UI/AIcon.vue'
import type { Toast } from '/@/store/ui/toast'
import { useToastStore } from '/@/store/ui/toast'

const iconNameMap = {
  success: 'info',
  error: 'alert',
  info: 'info'
} satisfies Record<Toast['type'], string>

const props = defineProps<{
  toast: Toast
}>()

const { deleteToast } = useToastStore()

watch(
  () => props.toast,
  ({ id, timeout }, _, onCleanup) => {
    if (timeout === Infinity) return

    const timer = setTimeout(() => deleteToast(id), timeout)
    onCleanup(() => clearTimeout(timer))
  },
  { immediate: true }
)

const onClick = () => {
  if (props.toast.onClick) {
    props.toast.onClick(props.toast.id)
  } else {
    deleteToast(props.toast.id)
  }
}

const iconName = computed(() => iconNameMap[props.toast.type])
</script>

<style lang="scss" module>
.container {
  @include drop-shadow-default;
  @include color-common-text-white-primary;
  display: flex;
  align-items: center;
  width: 320px;
  max-width: calc(100vw - 40px);
  margin: 12px 0;
  padding: 8px;
  border-radius: 4px;
  pointer-events: auto;
  user-select: none;
  &[data-type='success'] {
    @include background-accent-primary;
  }
  &[data-type='error'] {
    background: $theme-accent-error-default;
  }
  &[data-type='info'] {
    background: $theme-ui-secondary-background;
  }
  &[type='button'] {
    cursor: pointer;
    text-align: start;

    &:focus-visible {
      outline: 2px solid currentColor;
      outline-offset: -4px;
    }
  }
}
.icon {
  margin: 4px;
  flex-shrink: 0;
  vertical-align: middle;
}
.text {
  margin: 4px;
  word-break: break-all;
  white-space: pre-wrap;
}
</style>
