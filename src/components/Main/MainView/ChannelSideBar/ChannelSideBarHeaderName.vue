<template>
  <div :class="$style.container" :style="styles.container">
    <span :class="$style.channelHash" :style="styles.channelHash">#</span>
    <span :style="styles.channel">{{ state.channel }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, reactive } from '@vue/composition-api'
import { ChannelId } from '@/types/entity-ids'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import useChannelPath from '@/use/channelPath'

type Props = {
  channelId: ChannelId
}

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      color: theme.ui.primary
    }))
  })

export default defineComponent({
  name: 'ChannelSideBarHeaderName',
  props: { channelId: String },
  setup(props: Props) {
    const state = reactive({
      channel: computed(() => {
        const { channelIdToPath } = useChannelPath()
        const channelArray: string[] = channelIdToPath(props.channelId)
        console.log(channelArray)
        if (channelArray.length === 0) {
          return ""
        }
        return channelArray[channelArray.length - 1]
      })
    })
    const buildChannelLink = (channel: string) =>
      `${location.pathname}/${channel}`
    const styles = useStyles()
    return { props, state, styles, buildChannelLink }
  }
})
</script>

<style lang="scss" module>
$childChannelSize: 1.5rem;
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
  margin-left: 27px;
  user-select: none;
}
</style>
