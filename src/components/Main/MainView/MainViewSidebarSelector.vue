<template>
  <channel-sidebar
    :class="$style.messagesView"
    v-if="viewInfo && viewInfo.type === 'channel'"
    :channel-id="channelId"
  />
  <div :class="$style.none" v-else></div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from '@vue/composition-api'
import store from '@/store'
import { ViewInformation } from '@/store/ui/mainView/state'
import ChannelSidebar from '@/components/Main/MainView/ChannelSidebar/ChannelSidebar.vue'

export default defineComponent({
  name: 'MainViewSidebarSelector',
  components: { ChannelSidebar },
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
