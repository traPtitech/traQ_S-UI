<template>
  <div :class="$style.container" :style="styles.container">
    <channel-sidebar-pinned-list-item
      v-for="message in pinnedMessage"
      :key="message.message.id"
      :message="message.message"
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
    const styles = useStyles()
    const closeBar = () => {
      context.emit('closeBar')
    }
    return {
      styles,
      closeBar
    }
  }
})
</script>

<style lang="scss" module>
.container {
  padding-bottom: 32px;
}

.sidebarItem {
  margin-top: 16px;
}
</style>
