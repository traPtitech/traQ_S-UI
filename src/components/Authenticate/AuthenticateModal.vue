<template>
  <div :class="$style.container" :style="styles.container"><slot></slot></div>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.primary
    }))
  })

export default defineComponent({
  name: 'AuthenticateModal',
  setup() {
    const styles = useStyles()
    return { styles }
  }
})
</script>

<style lang="scss" module>
.container {
  border-radius: 4px;
  width: 100%;
  margin: 16px;
  max-width: 480px;
  padding: 48px;
}
</style>
