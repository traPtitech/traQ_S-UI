<template>
  <div
    @click="$emit('input')"
    :class="$style.container"
    :style="styles.container"
  >
    <div :class="$style.knob" :style="styles.knob"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, reactive } from '@vue/composition-api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'

const useStyles = (props: { enabled: boolean }) =>
  reactive({
    container: makeStyles(theme => ({
      background: props.enabled ? theme.accent.primary : theme.ui.tertiary
    })),
    knob: makeStyles(theme => ({
      background: theme.background.primary,
      transform: props.enabled ? 'translateX(16px)' : ''
    }))
  })

export default defineComponent({
  name: 'Toggle',
  props: {
    enabled: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const styles = useStyles(props)
    return { styles }
  }
})
</script>

<style lang="scss" module>
.container {
  position: relative;
  width: 44px;
  height: 24px;
  border-radius: 22px;
  transition: all 0.2s ease;
}
.knob {
  position: absolute;
  top: 4px;
  left: 6px;
  width: 16px;
  height: 16px;
  border-radius: 8px;
  transition: all 0.2s ease;
}
</style>
