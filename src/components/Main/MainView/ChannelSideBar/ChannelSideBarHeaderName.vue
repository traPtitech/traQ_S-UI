<template>
  <h2 :class="$style.container" :style="styles.container">
    <span :class="$style.channelHash">#</span>
    <span :class="$style.channel">{{ props.channelName }}</span>
  </h2>
</template>

<script lang="ts">
import { defineComponent, computed, reactive } from '@vue/composition-api'
import { ChannelId } from '@/types/entity-ids'
import { makeStyles } from '@/lib/styles'

type Props = {
  channelName: string
}

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      color: theme.ui.primary
    }))
  })

export default defineComponent({
  name: 'ChannelSideBarHeaderName',
  props: { channelName: String },
  setup(props: Props) {
    const styles = useStyles()
    return { props, styles }
  }
})
</script>

<style lang="scss" module>
$channelSize: 1.5rem;

.container {
  height: 100%;
}
.channel {
  font-size: $channelSize;
  margin: 0 0.125rem;
}
.channelHash {
  font-size: $channelSize;
  margin-right: 0.125rem;
  user-select: none;
}
</style>
