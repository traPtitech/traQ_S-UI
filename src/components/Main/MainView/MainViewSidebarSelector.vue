<template>
  <channel-sidebar
    v-if="viewInfo.type === 'channel'"
    :class="$style.messagesView"
    :channel-id="viewInfo.channelId"
    :is-sidebar-opener-ready="isSidebarOpenerReady"
  />
  <clips-sidebar
    v-else-if="viewInfo.type === 'clips'"
    :class="$style.messagesView"
    :clip-folder-id="viewInfo.clipFolderId"
    :is-sidebar-opener-ready="isSidebarOpenerReady"
  />
  <d-m-sidebar
    v-else-if="viewInfo.type === 'dm'"
    :class="$style.messagesView"
    :channel-id="viewInfo.channelId"
    :user-name="viewInfo.userName"
    :is-sidebar-opener-ready="isSidebarOpenerReady"
  />
  <div v-else :class="$style.none"></div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { ViewInformation } from '/@/store/ui/mainView/state'
import ChannelSidebar from '/@/components/Main/MainView/ChannelSidebar/ChannelSidebar.vue'
import ClipsSidebar from '/@/components/Main/MainView/ClipsSidebar/ClipsSidebar.vue'
import DMSidebar from '/@/components/Main/MainView/DMSidebar/DMSidebar.vue'

export default defineComponent({
  name: 'MainViewSidebarSelector',
  components: { ChannelSidebar, ClipsSidebar, DMSidebar },
  props: {
    viewInfo: {
      type: Object as PropType<ViewInformation>,
      required: true
    },
    isSidebarOpenerReady: {
      type: Boolean,
      required: true
    }
  },
  setup() {
    return {}
  }
})
</script>

<style lang="scss" module>
.none {
  display: none;
}
</style>
