<template>
  <h2 :class="$style.container" :style="styles.container">
    <span :class="$style.channelHash">#</span>
    <span :class="$style.channel">{{ channelName }}</span>
  </h2>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      color: theme.ui.primary
    }))
  })

export default defineComponent({
  name: 'ChannelSidebarHeaderName',
  props: {
    channelName: { type: String, required: true }
  },
  setup() {
    const styles = useStyles()
    return { styles }
  }
})
</script>

<style lang="scss" module>
$headerSize: 1.23rem;

.container {
  height: 100%;
  font-size: $headerSize;
}

.channelHash {
  margin-right: 0.125rem;
  user-select: none;
}
</style>
