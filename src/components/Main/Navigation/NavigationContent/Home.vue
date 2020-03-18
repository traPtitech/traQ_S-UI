<template>
  <!-- TODO: 折り畳みとコンポーネントへの分離 -->
  <div :class="$style.container">
    <div :class="$style.subtitle" :style="subtitleStyle">未読</div>
    <empty-state>Not Implemented</empty-state>
    <div :class="$style.subtitle" :style="subtitleStyle">チャンネル</div>
    <channel-list
      v-if="topLevelChannels.length !== 0"
      :channels="topLevelChannels"
    />
    <empty-state v-else>購読していません</empty-state>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, computed } from '@vue/composition-api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import EmptyState from '@/components/Util/EmptyState.vue'
import ChannelList from '@/components/Main/Navigation/ChannelList.vue'

type Props = {}

export default defineComponent({
  name: 'Channels',
  components: {
    ChannelList,
    EmptyState
  },
  setup(props: Props) {
    const topLevelChannels = computed(
      () => store.state.domain.channelTree.homeChannelTree.children ?? []
    )
    const subtitleStyle = makeStyles(theme => ({
      color: theme.ui.secondary
    }))
    return {
      topLevelChannels,
      subtitleStyle
    }
  }
})
</script>

<style lang="scss" module>
.subtitle {
  font-size: 0.75rem;
  margin-bottom: 8px;
}
</style>
