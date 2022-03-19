<template>
  <channel-view
    v-if="primaryView.type === 'channel'"
    :is-ready="isReady"
    :channel-id="primaryView.channelId"
    :entry-message-id="primaryView.entryMessageId"
  />
  <d-m-view
    v-else-if="primaryView.type === 'dm'"
    :is-ready="isReady"
    :channel-id="primaryView.channelId"
    :entry-message-id="primaryView.entryMessageId"
    :user-name="primaryView.userName"
  />
  <clips-view
    v-else-if="primaryView.type === 'clips'"
    :is-ready="isReady"
    :clip-folder-id="primaryView.clipFolderId"
  />
  <null-view v-else />
</template>

<script lang="ts" setup>
import ChannelView from './ChannelView/ChannelView.vue'
import DMView from './DMView/DMView.vue'
import ClipsView from './ClipsView/ClipsView.vue'
import NullView from './NullView/NullView.vue'
import { useMainViewStore } from '/@/store/ui/mainView'

const { primaryView } = useMainViewStore()

defineProps<{
  isReady: boolean
}>()
</script>

<style lang="scss" module>
.primaryContainer {
  display: flex;
  height: 100%;
}

.primary {
  min-width: 0;
  width: 100%;
}

.sidebar {
  height: 100%;
  flex-shrink: 0;
  z-index: $z-index-sidebar;
}
</style>
