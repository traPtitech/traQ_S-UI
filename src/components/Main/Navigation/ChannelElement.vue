<template>
  <div :class="$style.container" :style="styles.container">
    <div :class="$style['channel']">
      <div :class="$style['channel-hash']" @click="onChannelHashClick">
        <channel-element-hash
          :has-child="state.hasChild"
          :is-selected="props.isSelected"
          :is-opened="props.isOpened"
          :has-notification="false"
          :has-notification-on-child="false"
        />
      </div>
      <div :class="$style['channel-name']" @click="onChannelNameClick">
        {{ path }}{{ props.channel.name }}
      </div>
    </div>

    <div :class="$style.children" v-show="props.isOpened">
      <channel-list :channels="state.children" />
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  SetupContext,
  computed,
  ref,
  reactive
} from '@vue/composition-api'
import { ChannelTreeNode } from '@/store/domain/channelTree/state'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import ChannelElementHash from '@/components/Main/Navigation/ChannelElementHash.vue'
import ChannelList from '@/components/Main/Navigation/ChannelList.vue'
import { ChannelId } from '../../../types/entity-ids'

type Props = {
  /** 対象チャンネル */
  channel: ChannelTreeNode

  /** 現在表示中のチャンネルか */
  isSelected?: boolean

  /** 子チャンネルを展開表示しているか */
  isOpened?: boolean
}

const useAncestorPath = (skippedAncestorNames?: string[]) => {
  return {
    path: computed(() => skippedAncestorNames?.join('/')?.concat('/') ?? '')
  }
}

const useChannelClick = (
  context: SetupContext,
  id: ChannelId,
  hasChild: boolean
) => {
  const onChannelNameClick = () => context.emit('channel-select', id)
  const onChannelHashClick = () =>
    context.emit(hasChild ? 'channel-folding-toggle' : 'channel-select', id)
  return {
    onChannelHashClick,
    onChannelNameClick
  }
}

export default defineComponent({
  name: 'ChannelElement',
  components: {
    // 型エラーの回避
    ChannelList: () => import('./ChannelList.vue') as any,
    ChannelElementHash
  },
  props: {
    channel: {
      type: Object,
      required: true
    },
    isSelected: {
      type: Boolean,
      default: false
    },
    isOpened: {
      type: Boolean,
      default: false
    }
  },
  setup(props: Props, context) {
    const state = reactive({
      children: computed(() => props.channel.children ?? []),
      hasChild: computed((): boolean => state.children.length > 0)
    })

    const styles = reactive({
      container: makeStyles(theme => ({
        color: props.isSelected ? theme.accent.primary : theme.ui.primary
      }))
    })

    const { path } = useAncestorPath(props.channel.skippedAncestorNames)
    const { onChannelHashClick, onChannelNameClick } = useChannelClick(
      context,
      props.channel.id,
      state.hasChild
    )

    return {
      state,
      props,
      styles,
      path,
      onChannelHashClick,
      onChannelNameClick
    }
  }
})
</script>

<style lang="scss" module>
.container {
  display: block;
  user-select: none;
}
.channel {
  display: flex;
  align-items: center;
}
.channel-hash {
  flex-shrink: 0;
  cursor: pointer;
}
.channel-name {
  padding-left: 8px;
  width: 100%;
  cursor: pointer;
}
.children {
  margin-left: 24px;
  display: block;
}
</style>
