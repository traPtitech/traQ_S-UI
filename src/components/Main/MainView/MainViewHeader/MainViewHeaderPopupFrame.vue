<template>
  <div :class="$style.container" :style="styles.container">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'

const useStyles = () =>
  reactive({
    container: makeStyles((theme, common) => ({
      filter: common.dropShadow.default,
      background: theme.background.primary
    }))
  })

export default defineComponent({
  name: 'MainViewHeaderPopupFrame',
  setup() {
    const styles = useStyles()
    return { styles }
  }
})
</script>

<style lang="scss" module>
.container {
  display: grid;
  row-gap: 16px;
  width: max-content;
  padding: 16px;
  border-radius: 4px;
}
</style>
