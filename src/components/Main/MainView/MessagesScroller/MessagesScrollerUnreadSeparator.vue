<template>
  <div :class="$style.container" :style="styles.container">
    <div :class="$style.unread">
      ここから未読
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      color: theme.accent.notification
    }))
  })

export default defineComponent({
  name: 'MessagesScrollerUnreadSeparator',
  setup() {
    const styles = useStyles()
    return { styles }
  }
})
</script>

<style lang="scss" module>
.container {
  padding: 4px 12px;
}
.unread {
  display: flex;
  align-items: center;
  justify-content: space-between;
  &::before,
  &::after {
    display: block;
    background-color: currentColor;
    height: 1px;
    width: calc(50% - 70px);
    content: '';
    opacity: 0.1;
  }
}
</style>
