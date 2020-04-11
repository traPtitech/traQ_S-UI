<template>
  <h2 :class="$style.container" :style="styles.container">
    <span :class="$style.channelHash">#</span>
    <span :class="$style.channel">{{ channelName }}</span>
  </h2>
</template>

<script lang="ts">
import { defineComponent, computed, reactive } from '@vue/composition-api'
import { ChannelId } from '@/types/entity-ids'
import { makeStyles } from '@/lib/styles'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      color: theme.ui.primary
    }))
  })

export default defineComponent({
  name: 'ChannelSideBarHeaderName',
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
.container {
  height: 100%;
  font-size: 1.5rem;
}

.channelHash {
  margin-right: 0.125rem;
  user-select: none;
}
</style>
