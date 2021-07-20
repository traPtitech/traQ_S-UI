<template>
  <div
    :class="$style.container"
    :data-type="toast.type"
    :role="role"
    @click="onClick"
  >
    <icon :class="$style.icon" :name="iconName" mdi :size="32" />
    <div :class="$style.text">{{ toast.text }}</div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  computed,
  onMounted,
  onUnmounted
} from 'vue'
import Icon from '/@/components/UI/Icon.vue'
import useToastStore, { Toast } from '/@/providers/toastStore'

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

export default defineComponent({
  name: 'Toast',
  components: {
    Icon
  },
  props: {
    toast: {
      type: Object as PropType<Toast>,
      required: true
    }
  },
  setup(props) {
    const { remove } = useAutoHide(props)

    const onClick = () => {
      if (props.toast.onClick) {
        props.toast.onClick()
      } else {
        remove()
      }
    }

    const role = computed(() => (props.toast.onClick ? 'button' : false))

    const iconName = computed(() => iconNameMap[props.toast.type])
    return { onClick, iconName, role }
  }
})
</script>

<style lang="scss" module>
.container {
  @include drop-shadow-default;
  display: flex;
  align-items: center;
  width: 320px;
  max-width: calc(100vw - 40px);
  margin: 12px 0;
  padding: 8px;
  border-radius: 4px;
  pointer-events: auto;
  color: $theme-background-primary;
  user-select: none;
  &[data-type='success'] {
    @include background-accent-primary;
  }
  &[data-type='error'] {
    background: $theme-accent-error;
  }
  &[data-type='info'] {
    background: $theme-ui-secondary;
  }
  &[role='button'] {
    cursor: pointer;
  }
}
.icon {
  @include color-common-text-white-primary;
  margin: 4px;
  flex-shrink: 0;
  vertical-align: middle;
}
.text {
  margin: 4px;
  word-break: break-all;
}
</style>
