<template>
  <div :class="$style.container" :style="styles.container">
    traQ {{ version }}
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'

import { makeStyles } from '@/lib/styles'
import version from '@/lib/version'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      color: theme.ui.tertiary
    }))
  })

export default defineComponent({
  name: '',
  setup() {
    const styles = useStyles()
    return { version, styles }
  }
})
</script>

<style lang="scss" module>
.container {
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>
