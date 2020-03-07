<template>
  <div :class="$style.Block" class="navigation-content">
    <ul>
      <li
        v-for="channel in state.channels"
        :key="channel.channelId"
        @click="onClickChannel(channel.channelId)"
      >
        #{{ channel.name }}
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, computed } from '@vue/composition-api'
import store from '@/store'
import { ChannelId } from '../../../types/entity-ids'

export default defineComponent({
  name: 'NavigationContent',
  setup() {
    const state = reactive({
      channels: computed(() => store.state.entities.channels)
    })
    const onClickChannel = (channelId: ChannelId) => {
      store.commit.app.setCurrentChannelId(channelId ?? '')
      store.dispatch.entities.fetchMessagesByChannelId(channelId ?? '')
    }

    return { state, onClickChannel }
  }
})
</script>

<style lang="scss" module>
.Block {
  color: green;
  max-height: 100px;
  overflow: scroll;
}
</style>
