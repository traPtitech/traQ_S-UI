<template>
  <ChannelView
    v-if="primaryView.type === 'channel'"
    :is-ready="isReady"
    :channel-id="primaryView.channelId"
    :entry-message-id="primaryView.entryMessageId"
  />
  <ThreadView
    v-else-if="primaryView.type === 'thread'"
    :is-ready="isReady"
    :channel-id="primaryView.channelId"
    :entry-message-id="primaryView.entryMessageId"
  />
  <DMView
    v-else-if="primaryView.type === 'dm'"
    :is-ready="isReady"
    :channel-id="primaryView.channelId"
    :entry-message-id="primaryView.entryMessageId"
    :user-name="primaryView.userName"
    :show-thread-button="showThreadButton"
  />
  <ClipsView
    v-else-if="primaryView.type === 'clips'"
    :is-ready="isReady"
    :clip-folder-id="primaryView.clipFolderId"
  />
  <NullView v-else />
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'

import { useMainViewStore } from '/@/store/ui/mainView'

import ChannelView from './ChannelView/ChannelView.vue'
import ClipsView from './ClipsView/ClipsView.vue'
import DMView from './DMView/DMView.vue'
import NullView from './NullView/NullView.vue'
import ThreadView from './ThreadView/ThreadView.vue'

const { primaryView } = useMainViewStore()

const showThreadButton = ref(false)
watch(
  () => primaryView.value.type,
  value => {
    if (value === 'dm') {
      showThreadButton.value = true
    } else {
      showThreadButton.value = false
    }
  },
  { immediate: true }
)

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
