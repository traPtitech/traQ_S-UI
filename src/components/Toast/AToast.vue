<template>
  <div
    :class="$style.container"
    :data-type="toast.type"
    :role="role"
    @click="onClick"
  >
    <a-icon :class="$style.icon" :name="iconName" mdi :size="32" />
    <div :class="$style.text">
      {{ toast.text }}
    </div>
  </div>
</template>

<script lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import type { Toast } from '/@/store/ui/toast'
import { useToastStore } from '/@/store/ui/toast'

const iconNameMap: Record<Toast['type'], string> = {
  success: 'info',
  error: 'alert',
  info: 'info'
}

const useAutoHide = (props: { toast: Toast }) => {
  const { deleteToast } = useToastStore()

  let timer: number | undefined

  const remove = () => {
    deleteToast(props.toast.id)
  }

  onMounted(() => {
    timer = window.setTimeout(() => {
      remove()
    }, props.toast.timeout)
  })
  onUnmounted(() => {
    window.clearTimeout(timer)
  })

  return { remove }
}
</script>

<script lang="ts" setup>
import AIcon from '/@/components/UI/AIcon.vue'

const props = defineProps<{
  toast: Toast
}>()

const { remove } = useAutoHide(props)

const onClick = () => {
  if (props.toast.onClick) {
    props.toast.onClick()
  } else {
    remove()
  }
}

const role = computed(() => (props.toast.onClick ? 'button' : undefined))

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
  &[role='button'] {
    cursor: pointer;
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
