<template>
  <div
    :class="$style.container"
    :style="styles.container"
    :data-is-title="isTitle"
  >
    <user-icon :class="$style.icon" :user-id="id" :size="isTitle ? 24 : 20" />
    <span>
      {{ displayName }}
    </span>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  PropType,
  computed
} from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import { User } from '@traptitech/traq'
import UserIcon from '@/components/UI/UserIcon.vue'

const useStyles = (props: { isTitle: boolean }) =>
  reactive({
    container: makeStyles(theme => ({
      color: props.isTitle ? theme.ui.primary : theme.ui.secondary
    }))
  })

export default defineComponent({
  name: 'UserName',
  components: {
    UserIcon
  },
  props: {
    user: {
      type: Object as PropType<User>
    },
    isTitle: {
      type: Boolean,
      default: false
    }
  },
  setup(props, context) {
    const styles = useStyles(props)
    const id = computed(() => props.user?.id ?? 'unknown')
    const displayName = computed(() => props.user?.displayName ?? 'unknown')
    return {
      styles,
      id,
      displayName
    }
  }
})
</script>

<style lang="scss" module>
.container {
  @include size-body2;
  display: flex;
  align-items: center;
  word-break: keep-all;
  overflow-wrap: anywhere;
  &[data-is-title] {
    @include size-body1;
    font-weight: bold;
  }
}
.icon {
  margin-right: 8px;
}
</style>
