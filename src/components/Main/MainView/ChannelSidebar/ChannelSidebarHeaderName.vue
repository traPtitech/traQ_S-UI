<template>
  <h2 :class="$style.container" :style="styles.container">
    <span v-if="showHash" :class="$style.channelHash">#</span>
    <span>{{ channelName }}</span>
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
    channelName: { type: String, required: true },
    showHash: { type: Boolean, default: false }
  },
  setup() {
    const styles = useStyles()
    return { styles }
  }
})
</script>

<style lang="scss" module>
$headerSize: 1.25rem;

.container {
  height: 100%;
  font-size: $headerSize;
}

.channelHash {
  margin-right: 0.125rem;
  user-select: none;
}
</style>
