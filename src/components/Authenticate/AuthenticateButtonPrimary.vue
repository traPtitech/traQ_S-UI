<template>
  <button
    :class="$style.container"
    :style="styles.container"
    :disabled="disabled"
    @click="context.emit('click')"
  >
    {{ label }}
  </button>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'

const useStyles = (props: { disabled: boolean }) =>
  reactive({
    container: makeStyles(theme => ({
      borderColor: theme.accent.primary,
      background: theme.accent.primary,
      color: 'white',
      cursor: props.disabled ? 'not-allowed' : 'pointer'
    }))
  })

export default defineComponent({
  name: 'AuthenticateButtonPrimary',
  props: {
    label: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  setup(props, context) {
    const styles = useStyles(props)
    return { context, styles }
  }
})
</script>

<style lang="scss" module>
.container {
  padding: 12px 64px;
  border: {
    style: solid;
    width: 2px;
    radius: 4px;
  }
  font-weight: bold;
}
</style>
