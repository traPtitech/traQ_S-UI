<template>
  <div :class="$style.container" :style="styles.container">
    <div>aaaaaaaaaaaaavv</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, reactive, Ref } from '@vue/composition-api'
import { ChannelId } from '@/types/entity-ids'
import store from '@/store'
import { makeStyles } from '@/lib/styles'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.secondary,
      color: theme.ui.primary
    }))
  })

export default defineComponent({
  name: 'ChannelSideBarTopic',
  setup() {
    const styles = useStyles()
    return {
      styles
    }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  flex-basis: 250px;
  flex-direction: column;
  position: static;
}
</style>
