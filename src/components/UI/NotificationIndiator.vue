<template>
  <div :class="$style.container" :style="style"></div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import store from '@/store'
import { makeStyles } from '../../lib/styles'

export default defineComponent({
  name: 'NotificationIndicator',
  props: {
    color: {
      type: String,
      default: store.getters.app.themeSettings.currentTheme.background.secondary
    },
    hasBorder: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const style = makeStyles(theme => ({
      background: theme.accent.notification,
      borderColor: props.color,
      borderWidth: props.hasBorder ? '2px' : '0'
    }))
    return { style }
  }
})
</script>

<style lang="scss" module>
.container {
  width: 10px;
  height: 10px;
  border-radius: 100vw;
  border-style: solid;
}
</style>
