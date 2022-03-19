<template>
  <channel-header
    v-if="viewInfo.type === 'channel'"
    :channel-id="viewInfo.channelId"
  />
  <clips-header
    v-else-if="viewInfo.type === 'clips'"
    :clip-folder-id="viewInfo.clipFolderId"
  />
  <d-m-header
    v-else-if="viewInfo.type === 'dm'"
    :user-name="viewInfo.userName"
  />
  <div v-else :class="$style.none"></div>
</template>

<script lang="ts" setup>
import ChannelHeader from '/@/components/Main/MainView/ChannelView/ChannelHeader/ChannelHeader.vue'
import ClipsHeader from '/@/components/Main/MainView/ClipsView/ClipsHeader/ClipsHeader.vue'
import DMHeader from '/@/components/Main/MainView/DMView/DMHeader/DMHeader.vue'
import { ViewInformation } from '/@/store/ui/mainView'

defineProps<{
  viewInfo: ViewInformation
}>()
</script>

<style lang="scss" module>
.none {
  display: none;
}
</style>
