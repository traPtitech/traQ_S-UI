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
import store from '@/store'
import ChannelSideBarHeaderName from './ChannelSideBarHeaderName.vue'
import CloseButton from '@/components/Main/Modal/SettingModal/CloseButton.vue'

type Props = {
  channelId: ChannelId
}

const useStyles = (props: Props) =>
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
      channelName: computed(() =>
        store.getters.entities.channelNameById(props.channelId)
      )
    })
    const onClick = () => {
      context.emit('close')
    }
    const styles = useStyles(props)
    return { props, state, styles, onClick }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  justify-content: space-between;
  width: 256px;
  align-items: center;
  flex-shrink: 0;
}
</style>
