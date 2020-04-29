<template>
  <div :class="$style.container" :style="styles.container">
    <!-- チャンネル表示本体 -->
    <div :class="$style.channel">
      <div :class="$style.channelHash" @click="onChannelHashClick">
        <channel-element-hash
          :has-child="!ignoreChildren && state.hasChild"
          :is-selected="state.isSelected"
          :is-opened="isOpened"
          :has-notification="notificationState.hasNotification"
          :has-notification-on-child="notificationState.hasNotificationOnChild"
        />
      </div>
      <div
        :class="$style.channelName"
        :style="styles.channelName"
        @click="onChannelNameClick"
      >
        {{ path }}{{ channel.name }}
      </div>
    </div>

    <!-- 子チャンネル表示 -->
    <div :class="$style.children" v-show="isOpened" v-if="!ignoreChildren">
      <channel-list :channels="state.children" />
    </div>

    <!-- 選択中チャンネルの背景 -->
    <div
      :class="$style.selectedBg"
      :style="styles.selectedBg"
      v-if="state.isSelected"
    ></div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  SetupContext,
  computed,
  reactive,
  PropType
} from '@vue/composition-api'
import store from '@/store'
import { ChannelTreeNode } from '@/store/domain/channelTree/state'
import { makeStyles } from '@/lib/styles'
import { ChannelId } from '@/types/entity-ids'
import ChannelElementHash from './ChannelElementHash.vue'

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

const useStyles = (state: { isSelected: boolean }) => {
  const styles = reactive({
    container: makeStyles(theme => ({
      color: state.isSelected ? theme.accent.primary : theme.ui.primary
    })),
    selectedBg: makeStyles(theme => ({
      backgroundColor: theme.accent.primary
    })),
    channelName: makeStyles(theme => ({
      fontWeight: state.isSelected ? 'bold' : 'normal'
    }))
  })
  return styles
}

const useNotification = (props: { channel: ChannelTreeNode }) => {
  const notificationState = reactive({
    hasNotification: computed(
      () => props.channel.id in store.state.domain.me.unreadChannelsSet
    ),
    hasNotificationOnChild: computed(() =>
      props.channel.children.some(
        treeNode => treeNode.id in store.state.domain.me.unreadChannelsSet
      )
    )
  })
  return notificationState
}

type UnknownAsyncComponent = AsyncComponent<unknown, unknown, unknown, unknown>

export default defineComponent({
  name: 'ChannelElement',
  components: {
    // 型エラー・コンポーネント循環参照の回避
    ChannelList: (() => import('./ChannelList.vue')) as UnknownAsyncComponent,
    ChannelElementHash
  },
  props: {
    /** 対象チャンネル */
    channel: {
      type: Object as PropType<ChannelTreeNode>,
      required: true
    },
    /** 子チャンネルを展開表示しているか */
    isOpened: {
      type: Boolean,
      default: false
    },
    /** 子チャンネルを無視する */
    ignoreChildren: {
      type: Boolean,
      default: false
    }
  },
  setup(props, context) {
    const state = reactive({
      children: computed(() => props.channel.children ?? []),
      hasChild: computed((): boolean => state.children.length > 0),
      isSelected: computed(
        () =>
          store.state.domain.messagesView.currentChannelId === props.channel.id
      )
    })

    const styles = useStyles(state)
    const { path } = useAncestorPath(props.channel.skippedAncestorNames)
    const { onChannelHashClick, onChannelNameClick } = useChannelClick(
      context,
      props.channel.id,
      state.hasChild
    )
    const notificationState = useNotification(props)

    return {
      state,
      styles,
      path,
      notificationState,
      onChannelHashClick,
      onChannelNameClick
    }
  }
})
</script>

<style lang="scss" module>
$elementHeight: 32px;
$bgHeight: 36px;
$bgLeftShift: 4px;

.container {
  display: block;
  user-select: none;
  position: relative;
}
.channel {
  display: flex;
  align-items: center;
  position: relative;
  height: $elementHeight;
  z-index: 0;
}
.channelHash {
  flex-shrink: 0;
  cursor: pointer;
}
.channelName {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  padding-left: 8px;
  font-size: 1rem;
  cursor: pointer;
}
.children {
  display: block;
  position: relative;
  z-index: 0;
  margin-left: 24px;
}
.selectedBg {
  position: absolute;
  width: calc(100% + #{$bgLeftShift});
  height: $bgHeight;
  top: -($bgHeight - $elementHeight)/2;
  left: -$bgLeftShift;
  z-index: 0;
  border-top-left-radius: 100vw;
  border-bottom-left-radius: 100vw;
  opacity: 0.1;
  pointer-events: none;
}
</style>
