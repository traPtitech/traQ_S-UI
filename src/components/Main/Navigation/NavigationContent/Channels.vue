<template>
  <channel-list :channels="topLevelChannels" />
</template>

<script lang="ts">
import { defineComponent, reactive, computed } from '@vue/composition-api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import ChannelList from '@/components/Main/Navigation/ChannelList/ChannelList.vue'

type Props = {}

export default defineComponent({
  name: 'Channels',
  components: {
    ChannelList
  },
  setup(props: Props) {
    const topLevelChannels = computed(
      () => store.state.domain.channelTree.channelTree.children ?? []
    )
    return {
      topLevelChannels
    }
  }
})
</script>
