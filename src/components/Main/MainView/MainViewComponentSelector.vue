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
  <qall-view v-else-if="viewInfo.type === 'qall'" />
  <div :class="$style.none" v-else></div>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@vue/composition-api'
import { ViewInformation } from '@/store/ui/mainView/state'
import ChannelView from '@/components/Main/MainView/ChannelView/ChannelView.vue'
import ClipsView from '@/components/Main/MainView/ClipsView/ClipsView.vue'
import QallView from '@/components/Main/MainView/QallView/QallView.vue'

export default defineComponent({
  name: 'MainViewComponentSelector',
  components: { ChannelView, ClipsView, QallView },
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

<style lang="scss" module>
.none {
  display: none;
}
</style>
