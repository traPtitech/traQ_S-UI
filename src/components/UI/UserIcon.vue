<template>
  <div :class="$style.container" :style="styles.container">
    <!-- TODO: Badge -->
  </div>
</template>

<script lang="ts">
import { defineComponent, SetupContext, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import api, { BASE_PATH, User } from '@/lib/api'

type IconSize = 36 | 28 | 20

type Props = { user: User; size: IconSize }

export default defineComponent({
  name: 'UserIcon',
  props: {
    user: {
      type: Object,
      required: true
    },
    size: {
      type: Number,
      default: 36 as IconSize
    }
  },
  setup(props: Props, context: SetupContext) {
    const styles = reactive({
      container: makeStyles(theme => ({
        color: theme.ui.secondary,
        width: `${props.size}px`,
        height: `${props.size}px`,
        backgroundImage: `url(${BASE_PATH}/users/${props.user.id}/icon)`
      }))
    })
    return {
      props,
      styles
    }
  }
})
</script>

<style lang="scss" module>
.container {
  border-radius: 100vw;
  background: {
    position: center;
    repeat: no-repeat;
    size: cover;
  }
}
</style>
