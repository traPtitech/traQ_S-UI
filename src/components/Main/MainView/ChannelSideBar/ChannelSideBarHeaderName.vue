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
  color: string
  size: string
}

const useStyles = (props: Props) =>
  reactive({
    container: makeStyles(theme => ({
      color: props.color,
      fontSize: props.size
    }))
  })

export default defineComponent({
  name: 'ChannelSideBarHeaderName',
  props: {
    channelName: String,
    color: { type: String, default: 'primary' },
    fontSize: { type: String, default: '1.5rem' }
  },
  setup(props: Props) {
    const styles = useStyles(props)
    return { props, styles }
  }
})
</script>

<style lang="scss" module>
.container {
  height: 100%;
}

.channelHash {
  margin-right: 0.125rem;
  user-select: none;
}
</style>
