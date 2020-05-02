<template>
  <div :class="$style.container" :style="style"></div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import store from '@/store'
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
      background: theme.accent.notification,
      borderColor:
        props.color ??
        store.getters.app.themeSettings.currentTheme.background.secondary,
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
  border-radius: 100vw;
  border-style: solid;
}
</style>
