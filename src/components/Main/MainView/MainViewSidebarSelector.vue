<template>
  <channel-sidebar
    v-if="viewInfo.type === 'channel'"
    :channel-id="viewInfo.channelId"
    :is-sidebar-opener-ready="isSidebarOpenerReady"
  />
  <clips-sidebar
    v-else-if="viewInfo.type === 'clips'"
    :clip-folder-id="viewInfo.clipFolderId"
    :is-sidebar-opener-ready="isSidebarOpenerReady"
  />
  <d-m-sidebar
    v-else-if="viewInfo.type === 'dm'"
    :channel-id="viewInfo.channelId"
    :user-name="viewInfo.userName"
    :is-sidebar-opener-ready="isSidebarOpenerReady"
  />
  <div v-else :class="$style.none"></div>
</template>

<script lang="ts" setup>
import ChannelSidebar from '/@/components/Main/MainView/ChannelSidebar/ChannelSidebar.vue';
import ClipsSidebar from '/@/components/Main/MainView/ClipsSidebar/ClipsSidebar.vue';
import DMSidebar from '/@/components/Main/MainView/DMSidebar/DMSidebar.vue';
import { ViewInformation } from '/@/store/ui/mainView'

defineProps<{
    viewInfo: ViewInformation,
    isSidebarOpenerReady: boolean
}>()


</script>

<style lang="scss" module>
.none {
  display: none;
}
</style>
