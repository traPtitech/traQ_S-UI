<template>
  <div :class="$style.container" :style="styles.container">
    <channel-sidebar-header-name :channel-name="state.channelName" />
    <close-button @click="onClick" :size="28" />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  reactive,
  PropType
} from '@vue/composition-api'
import { ChannelId } from '@/types/entity-ids'
import { makeStyles } from '@/lib/styles'
import store from '@/store'
import ChannelSidebarHeaderName from './ChannelSidebarHeaderName.vue'
import CloseButton from '@/components/UI/CloseButton.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      color: theme.ui.primary
    }))
  })

export default defineComponent({
  name: 'ChannelSidebarHeader',
  props: { channelId: { type: String as PropType<ChannelId>, required: true } },
  components: { ChannelSidebarHeaderName, CloseButton },
  setup(props, context) {
    const state = reactive({
      channelName: computed(
        () => store.state.entities.channels[props.channelId]?.name
      )
    })
    const onClick = () => {
      context.emit('close')
    }
    const styles = useStyles()
    return { state, styles, onClick }
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
