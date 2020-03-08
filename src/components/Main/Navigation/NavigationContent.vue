<template>
  <div :class="$style.container">
    <channel-list />
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

    return { state, onClickChannel }
  }
})
</script>

<style lang="scss" module>
.container {
  width: 100%;
  height: 100%;
  overflow: scroll;
}
</style>
