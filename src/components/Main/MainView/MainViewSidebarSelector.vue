<template>
  <channel-sidebar
    :class="$style.messagesView"
    v-if="viewInfo.type === 'channel'"
    :channel-id="viewInfo.channelId"
  />
  <clips-sidebar
    :class="$style.messagesView"
    v-else-if="viewInfo.type === 'clips'"
    :clip-folder-id="viewInfo.clipFolderId"
  />
  <div :class="$style.none" v-else></div>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@vue/composition-api'
import { ViewInformation } from '@/store/ui/mainView/state'
import ChannelSidebar from '@/components/Main/MainView/ChannelSidebar/ChannelSidebar.vue'
import ClipsSidebar from '@/components/Main/MainView/ClipsSidebar/ClipsSidebar.vue'

export default defineComponent({
  name: 'MainViewSidebarSelector',
  components: { ChannelSidebar, ClipsSidebar },
  props: {
    viewInfo: { type: Object as PropType<ViewInformation>, required: true }
  },
  setup(props) {
    return {}
  }
})
</script>

<style lang="scss" module>
.none {
  display: none;
}
</style>
