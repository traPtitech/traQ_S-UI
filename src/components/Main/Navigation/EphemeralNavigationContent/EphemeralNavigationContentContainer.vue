<template>
  <div :class="$style.container" :style="styles.container">
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'

import { makeStyles } from '@/lib/styles'

const useStyles = (props: { transparent: boolean }) =>
  reactive({
    container: makeStyles(theme => ({
      background: props.transparent ? 'transparent' : theme.background.tertiary
    }))
  })

export default defineComponent({
  name: 'EphemeralNavigationContentContainer',
  props: { transparent: { type: Boolean, default: false } },
  setup(props) {
    const styles = useStyles(props)
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
