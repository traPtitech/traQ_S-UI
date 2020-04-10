<template>
  <button
    :class="$style.container"
    :style="styles.container"
    @click="context.emit('click')"
  >
    {{ label }}
  </button>
</template>

<script lang="ts">
import { defineComponent, SetupContext, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.accent.primary,
      color: 'white'
    }))
  })

export default defineComponent({
  name: 'AuthenticateButtonPrimary',
  props: {
    label: {
      type: String,
      default: ''
    }
  },
  setup(props, context: SetupContext) {
    const styles = useStyles()
    return { context, styles }
  }
})
</script>

<style lang="scss" module>
.container {
  padding: 12px 64px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
}
</style>
