<template>
  <div :class="$style.container">
    <channel-list :channels="topLevelChannels" />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, computed } from '@vue/composition-api'
import store from '@/store'
import { ChannelId } from '../../../types/entity-ids'
import ChannelList from './ChannelList.vue'

export default defineComponent({
  name: 'NavigationContent',
  components: {
    ChannelList
  },
  setup() {
    store.dispatch.entities.fetchChannels()
    const state = reactive({
      channels: computed(() => store.state.entities.channels)
    })
    const onClickChannel = (channelId?: ChannelId) => {
      store.commit.app.setCurrentChannelId(channelId ?? '')
      store.dispatch.entities.fetchMessagesByChannelId(channelId ?? '')
    }
    const topLevelChannels = computed(
      () => store.state.domain.channelTree.channelTree.children ?? []
    )

    return { state, onClickChannel, topLevelChannels }
  }
})
</script>

<style lang="scss" module>
.container {
  width: 100%;
  height: 100%;
  overflow: scroll;
  padding-left: 24px;
}
</style>
