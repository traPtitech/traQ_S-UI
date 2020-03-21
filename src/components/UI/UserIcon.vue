<template>
  <div :class="$style.container" :style="styles.container">
    <!-- TODO: Badge -->
  </div>
</template>

<script lang="ts">
import { defineComponent, SetupContext, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import api, { BASE_PATH, User } from '@/lib/api'
import { UserId } from '@/types/entity-ids'

type IconSize = 42 | 36 | 28 | 20

type Props = { userId: UserId; size: IconSize }

export default defineComponent({
  name: 'UserIcon',
  props: {
    userId: {
      type: String,
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
        backgroundImage: `url(${BASE_PATH}/users/${props.userId}/icon)`
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
  flex: {
    shrink: 0;
    grow: 0;
  }
  background: {
    position: center;
    repeat: no-repeat;
    size: cover;
  }
}
</style>
