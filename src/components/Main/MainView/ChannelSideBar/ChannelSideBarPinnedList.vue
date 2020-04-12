<template>
  <div :class="$style.container" :style="styles.container">
    <channel-side-bar-pinned-list-header
      @closePinned="closePinned"
      @closeBar="closeBar"
      :class="$style.sidebarItem"
    />
    <channel-side-bar-pinned-list-item
      v-for="message in propst.pinnedMessage"
      :key="message.message.id"
      :pinned-message="message"
      :class="$style.sidebarItem"
    />
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
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import { ChannelViewState, Pin } from '@traptitech/traq'
import ChannelSideBarPinnedListHeader from './ChannelSideBarPinnedListHeader.vue'
import ChannelSideBarPinnedListItem from './ChannelSideBarPinnedListItem.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.secondary,
      color: theme.ui.secondary
    }))
  })

export default defineComponent({
  name: 'ChannelSideBarPinnedList',
  components: { ChannelSideBarPinnedListHeader, ChannelSideBarPinnedListItem },
  props: {
    pinnedMessage: { type: Array as PropType<Pin[]>, default: [] }
  },
  setup(props, context) {
    // TODO: https://github.com/vuejs/composition-api/issues/291
    const propst = props as { pinnedMessage: Pin[] }
    const styles = useStyles()
    const closeBar = () => {
      context.emit('closeBar')
    }
    const closePinned = () => {
      context.emit('closePinned')
    }
    return {
      propst,
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
