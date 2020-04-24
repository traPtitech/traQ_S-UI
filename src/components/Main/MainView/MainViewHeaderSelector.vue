<template>
  <channel-view-header
    v-if="viewInfo.type === 'channel'"
    :channel-id="channelId"
  />
  <clips-header
    v-else-if="viewInfo.type === 'clips'"
    :clip-folder-id="viewInfo.clipFolderId"
  />
  <div :class="$style.none" v-else></div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from '@vue/composition-api'
import store from '@/store'
import { ViewInformation } from '@/store/ui/mainView/state'
import ChannelViewHeader from '@/components/Main/MainView/ChannelView/Header.vue'
import ClipsHeader from '@/components/Main/MainView/ClipsHeader/ClipsHeader.vue'

export default defineComponent({
  name: 'MainViewHeaderSelector',
  components: { ChannelViewHeader, ClipsHeader },
  props: {
    viewInfo: Object as PropType<ViewInformation>
  },
  setup(props) {
    const channelId = computed(
      () => store.state.domain.messagesView.currentChannelId
    )

    return {
      channelId
    }
  }
})
</script>

<style lang="scss" module>
.none {
  display: none;
}
</style>
