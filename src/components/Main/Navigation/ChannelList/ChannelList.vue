<template>
  <div class="channel-list">
    <channel-element
      v-for="channel in channels"
      :key="channel.id"
      :class="$style.element"
      :channel="channel"
      :is-opened="channelFoldingState[channel.id]"
      :ignore-children="ignoreChildren"
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
  toRefs,
  SetupContext,
  PropType
} from '@vue/composition-api'
import store from '@/store'
import { ChannelId } from '@/types/entity-ids'
import { ChannelTreeNode } from '@/store/domain/channelTree/state'
import useChannelSelect from '@/use/channelSelect'
import ChannelElement from './ChannelElement.vue'

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

export default defineComponent({
  name: 'ChannelList',
  components: {
    // 型エラー・コンポーネント循環参照の回避
    ChannelElement: () => import('./ChannelElement.vue') as any
  },
  props: {
    channels: {
      type: Array as PropType<ChannelTreeNode[]>,
      required: true
    },
    ignoreChildren: {
      type: Boolean,
      default: false
    }
  },
  setup(props, context) {
    const { onChannelSelect } = useChannelSelect(context)
    const { channelFoldingState, onChannelFoldingToggle } = useChannelFolding()
    return {
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
