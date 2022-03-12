<template>
  <channel-view
    v-if="viewInfo.type === 'channel' || viewInfo.type === 'dm'"
    :channel-id="viewInfo.channelId"
    :entry-message-id="viewInfo.entryMessageId"
  />
  <clips-view
    v-else-if="viewInfo.type === 'clips'"
    :clip-folder-id="viewInfo.clipFolderId"
  />
  <null-view v-else />
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { ViewInformation } from '/@/store/ui/mainView'
import ChannelView from '/@/components/Main/MainView/ChannelView/ChannelView.vue'
import ClipsView from '/@/components/Main/MainView/ClipsView/ClipsView.vue'
import NullView from '/@/components/Main/MainView/NullView/NullView.vue'

export default defineComponent({
  name: 'MainViewComponentSelector',
  components: { ChannelView, ClipsView, NullView },
  props: {
    viewInfo: {
      type: Object as PropType<ViewInformation>,
      required: true
    }
  },
  setup() {
    return {}
  }
})
</script>
