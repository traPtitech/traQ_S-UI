<template>
  <div :class="$style.container">
    <channel-sidebar-pinned-list-item
      v-for="message in pinnedMessage"
      :key="message.message.id"
      :message="message.message"
      :class="$style.sidebarItem"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@vue/composition-api'
import { Pin } from '@traptitech/traq'
import ChannelSidebarPinnedListItem from './ChannelSidebarPinnedListItem.vue'

export default defineComponent({
  name: 'ChannelSidebarPinnedList',
  components: { ChannelSidebarPinnedListItem },
  props: {
    pinnedMessage: { type: Array as PropType<Pin[]>, default: [] }
  },
  setup(props, context) {
    const closeBar = () => {
      context.emit('closeBar')
    }
    return { closeBar }
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-secondary;
  @include background-secondary;
  padding-bottom: 32px;
}

.sidebarItem {
  margin-top: 16px;
}
</style>
