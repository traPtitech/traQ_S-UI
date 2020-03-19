<template>
  <div :class="$style.container" :style="styles.container">
    <!-- チャンネル表示本体 -->
    <div :class="$style.channel">
      <div :class="$style['channel-hash']" @click="onChannelHashClick">
        <!-- TODO: 通知関連対応 -->
        <channel-element-hash
          :has-child="state.hasChild"
          :is-selected="state.isSelected"
          :is-opened="props.isOpened"
          :has-notification="false"
          :has-notification-on-child="false"
        />
      </div>
      <div
        :class="$style['channel-name']"
        :style="styles.channelName"
        @click="onChannelNameClick"
      >
        {{ path }}{{ props.channel.name }}
      </div>
    </div>

    <!-- 子チャンネル表示 -->
    <div :class="$style.children" v-show="props.isOpened">
      <channel-list :channels="state.children" />
    </div>

    <!-- 選択中チャンネルの背景 -->
    <div
      :class="$style['selected-bg']"
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

export default defineComponent({
  name: 'ChannelElement',
  components: {
    // 型エラー・コンポーネント循環参照の回避
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
      hasChild: computed((): boolean => state.children.length > 0),
      isSelected: computed(
        () => store.state.app.currentChannelId === props.channel.id
      )
    })

    const styles = useStyles(state)
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
.channel-hash {
  flex-shrink: 0;
  cursor: pointer;
}
.channel-name {
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
.selected-bg {
  position: absolute;
  width: calc(100% + #{$bgLeftShift});
  height: $bgHeight;
  top: -($bgHeight - $elementHeight)/2;
  left: -$bgLeftShift;
  z-index: 0;
  border-top-left-radius: 100vw;
  border-bottom-left-radius: 100vw;
  opacity: 10%;
  pointer-events: none;
}
</style>
