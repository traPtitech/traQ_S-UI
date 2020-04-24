<template>
  <channel-view
    :class="$style.messagesView"
    v-if="viewInfo.type === 'channel' && channelId"
    :channel-id="viewInfo.channelId"
    :entry-message-id="viewInfo.entryMessageId"
  />
  <clips-view
    :class="$style.messagesView"
    v-else-if="viewInfo.type === 'clips' && clipFolderId"
    :clip-folder-id="clipFolderId"
  />
  <div :class="$style.none" v-else></div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from '@vue/composition-api'
import store from '@/store'
import { ViewInformation } from '@/store/ui/mainView/state'
import ChannelView from '@/components/Main/MainView/ChannelView/ChannelView.vue'
import ClipsView from '@/components/Main/MainView/ClipsView/ClipsView.vue'

export default defineComponent({
  name: 'MainViewComponentSelector',
  components: { ChannelView, ClipsView },
  props: {
    viewInfo: {
      type: Object as PropType<ViewInformation>,
      required: true
    }
  },
  setup(props) {
    const channelId = computed(
      () => store.state.domain.messagesView.currentChannelId
    )
    const clipFolderId = computed(
      () => store.state.domain.messagesView.currentClipFolderId
    )

    return {
      channelId,
      clipFolderId
    }
  }
})
</script>

<style lang="scss" module>
.none {
  display: none;
}
</style>
