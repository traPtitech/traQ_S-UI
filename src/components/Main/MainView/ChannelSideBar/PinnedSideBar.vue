<template>
  <div :class="$style.container" :style="styles.container">
    <pinned-side-bar-header
      @closePinned="closePinned"
      @closeBar="closeBar"
      :class="$style.sidebarItem"
    />
    <pinned-side-bar-item
      v-for="message in props.pinnedMessage"
      :key="message.message.id"
      :pinnedMessage="message"
      :class="$style.sidebarItem"
    />
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
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import { ChannelViewState, Pin } from '@traptitech/traq'
import PinnedSideBarHeader from './PinnedSideBarHeader.vue'
import PinnedSideBarItem from './PinnedSideBarItem.vue'

type Props = {
  pinnedMessage: Pin[]
}

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.secondary,
      color: theme.ui.secondary
    }))
  })

export default defineComponent({
  name: 'PinnedSideBar',
  components: { PinnedSideBarHeader, PinnedSideBarItem },
  props: {
    pinnedMessage: { type: Array, default: [] }
  },
  setup(props: Props, context: SetupContext) {
    const styles = useStyles()
    const closeBar = () => {
      context.emit('closeBar')
    }
    const closePinned = () => {
      context.emit('closePinned')
    }
    return {
      props,
      styles,
      closeBar,
      closePinned
    }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  flex-direction: column;
  width: 320px;
  height: 100%;
  padding: 0 32px;
  overflow: auto;
}

.sidebarItem {
  margin-top: 16px;
}
</style>
