<template>
  <channel-view-header
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
import ChannelViewHeader from '@/components/Main/MainView/ChannelView/Header.vue'

export default defineComponent({
  name: 'MainViewHeaderSelector',
  components: { ChannelViewHeader },
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
