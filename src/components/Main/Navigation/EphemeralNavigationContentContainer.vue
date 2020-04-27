<template>
  <div :class="$style.container" :style="styles.container">
    えふぇめらる
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'

import { makeStyles } from '@/lib/styles'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.tertiary
    }))
  })

export default defineComponent({
  name: 'EphemeralNavigationContentContainer',
  setup() {
    const styles = useStyles()
    return { styles }
  }
})
</script>

<style lang="scss" module>
.container {
  width: 100%;
  border-top: {
    left-radius: 8px;
    right-radius: 8px;
  }
}
</style>
