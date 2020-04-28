<template>
  <div :class="$style.container" :style="styles.container">
    <channel-sidebar-pinned-list-item
      v-for="message in propst.pinnedMessage"
      :key="message.message.id"
      :pinned-message="message"
      :class="$style.sidebarItem"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, PropType } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import { Pin } from '@traptitech/traq'
import ChannelSidebarPinnedListItem from './ChannelSidebarPinnedListItem.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.secondary,
      color: theme.ui.secondary
    }))
  })

export default defineComponent({
  name: 'ChannelSidebarPinnedList',
  components: { ChannelSidebarPinnedListItem },
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
    return {
      propst,
      styles,
      closeBar
    }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: auto;
}

.sidebarItem {
  margin-top: 16px;
}
</style>
