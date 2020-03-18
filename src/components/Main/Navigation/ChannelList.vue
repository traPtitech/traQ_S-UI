<template>
  <div class="channel-list">
    <channel-element
      v-for="channel in props.channels"
      :key="channel.id"
      :class="$style.element"
      :channel="channel"
      :is-opened="channelFoldingState[channel.id]"
      @channel-select="onChannelSelect"
      @channel-folding-toggle="onChannelFoldingToggle"
    />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  reactive,
  set,
  toRefs
} from '@vue/composition-api'
import store from '@/store'
import { ChannelId } from '@/types/entity-ids'
import { ChannelTreeNode } from '../../../store/domain/channelTree/state'
import ChannelElement from '@/components/Main/Navigation/ChannelElement.vue'

const useChannelSelect = () => {
  const onChannelSelect = (id: ChannelId) => {
    store.commit.app.setCurrentChannelId(id)
  }
  return {
    onChannelSelect
  }
}

const useChannelFolding = () => {
  const state = reactive({
    channelFoldingState: {} as Record<ChannelId, boolean>
  })
  const onChannelFoldingToggle = (id: ChannelId) => {
    if (state.channelFoldingState[id]) {
      state.channelFoldingState[id] = false
    } else {
      set(state.channelFoldingState, id, true)
    }
  }
  return {
    ...toRefs(state),
    onChannelFoldingToggle
  }
}

type Props = {
  channels: ChannelTreeNode[]
}

export default defineComponent({
  name: 'ChannelList',
  components: {
    // 型エラーの回避
    ChannelElement: () => import('./ChannelElement.vue') as any
  },
  props: {
    channels: {
      type: Array,
      required: true
    }
  },
  setup(props: Props) {
    const { onChannelSelect } = useChannelSelect()
    const { channelFoldingState, onChannelFoldingToggle } = useChannelFolding()
    return {
      props,
      channelFoldingState,
      onChannelSelect,
      onChannelFoldingToggle
    }
  }
})
</script>

<style lang="scss" module>
.element {
  margin: 4px 0;
}
</style>
