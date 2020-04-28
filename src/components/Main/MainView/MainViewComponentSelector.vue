<template>
  <channel-view
    :class="$style.messagesView"
    v-if="viewInfo.type === 'channel'"
    :channel-id="viewInfo.channelId"
    :entry-message-id="viewInfo.entryMessageId"
  />
  <clips-view
    :class="$style.messagesView"
    v-else-if="viewInfo.type === 'clips'"
    :clip-folder-id="viewInfo.clipFolderId"
  />
  <d-m-view
    :class="$style.messagesView"
    v-else-if="viewInfo.type === 'dm'"
    :user-id="viewInfo.userId"
  />
  <div :class="$style.none" v-else></div>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@vue/composition-api'
import { ViewInformation } from '@/store/ui/mainView/state'
import ChannelView from '@/components/Main/MainView/ChannelView/ChannelView.vue'
import ClipsView from '@/components/Main/MainView/ClipsView/ClipsView.vue'
import DMView from '@/components/Main/MainView/DMView/DMView.vue'

export default defineComponent({
  name: 'MainViewComponentSelector',
  components: { ChannelView, ClipsView, DMView },
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
