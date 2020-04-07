<template>
  <div :class="$style.container" :style="styles.container">
    <channel-side-bar-header-name :channel-name="state.channelName" />
    <close-button @click="onClick" :size="28" :backgroundColor="'secondary'" />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  reactive,
  SetupContext
} from '@vue/composition-api'
import { ChannelId } from '@/types/entity-ids'
import { makeStyles } from '@/lib/styles'
import useChannelPath from '@/use/channelPath'
import ChannelSideBarHeaderName from './ChannelSideBarHeaderName.vue'
import CloseButton from '@/components/Main/Modal/SettingModal/CloseButton.vue'

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
  name: 'ChannelSideBarHeader',
  props: { channelId: String },
  components: { ChannelSideBarHeaderName, CloseButton },
  setup(props: Props, context: SetupContext) {
    const state = reactive({
      channelName: computed(() => {
        const { channelIdToPath } = useChannelPath()
        const channelArray: string[] = channelIdToPath(props.channelId)
        if (channelArray.length === 0) {
          return ''
        }
        return channelArray[channelArray.length - 1]
      })
    })
    const onClick = () => {
      context.emit('close')
    }
    const styles = useStyles()
    return { props, state, styles, onClick }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  width: 256px;
  align-items: center;
  flex-shrink: 0;
}
</style>
