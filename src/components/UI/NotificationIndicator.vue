<template>
  <div :class="$style.container" :style="style"></div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'

export default defineComponent({
  name: 'NotificationIndicator',
  props: {
    color: String,
    size: {
      type: Number,
      default: 10
    },
    hasBorder: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const style = makeStyles(theme => ({
      borderColor: props.color,
      borderWidth: props.hasBorder ? '2px' : '0',
      width: `${props.size}px`,
      height: `${props.size}px`
    }))
    return { style }
  }
})
</script>

<style lang="scss" module>
.container {
  background: $theme-accent-notification;
  border: {
    style: solid;
    color: $theme-background-secondary;
    radius: 100vw;
  }
}
</style>
