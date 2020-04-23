<template>
  <channel-view
    :class="$style.messagesView"
    v-if="viewInfo && viewInfo.type === 'channel'"
    :channel-id="channelId"
  />
  <qall-view v-else-if="viewInfo && viewInfo.type === 'qall'" />
  <div :class="$style.none" v-else></div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from '@vue/composition-api'
import store from '@/store'
import { ViewInformation } from '@/store/ui/mainView/state'
import ChannelView from '@/components/Main/MainView/ChannelView/ChannelView.vue'
import QallView from '@/components/Main/MainView/QallView/QallView.vue'

export default defineComponent({
  name: 'MainViewComponentSelector',
  components: { ChannelView, QallView },
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
