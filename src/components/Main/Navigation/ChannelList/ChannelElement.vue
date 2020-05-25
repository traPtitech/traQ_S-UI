<template>
  <div
    :class="$style.container"
    :aria-selected="state.isSelected ? 'true' : 'false'"
  >
    <!-- チャンネル表示本体 -->
    <div :class="$style.channel" :data-is-inactive="state.isInactive">
      <channel-element-hash
        :class="$style.channelHash"
        @click.native="onChannelHashClick"
        :has-child="!ignoreChildren && state.hasChild"
        :is-selected="state.isSelected"
        :is-opened="isOpened"
        :has-notification="notificationState.hasNotification"
        :has-notification-on-child="notificationState.hasNotificationOnChild"
        :is-inactive="state.isInactive"
      />
      <div :class="$style.channelName" @click="onChannelNameClick">
        <span :class="$style.channelNameString" :title="pathTooltip">
          {{ pathToShow }}
        </span>
        <icon
          v-if="isQalling"
          :size="16"
          mdi
          name="phone-outline"
          :class="$style.channelNameIcon"
        />
      </div>
      <div
        v-if="notificationState.unreadCount"
        :class="$style.unreadBadge"
        :data-is-noticeable="notificationState.isNoticeable"
        @click="onChannelNameClick"
      >
        {{ notificationState.unreadCount }}
      </div>
    </div>
    <div v-if="showTopic" :class="$style.topic" @click="onChannelNameClick">
      {{ topic }}
    </div>

    <!-- 子チャンネル表示 -->
    <channel-list
      :is-shown="!ignoreChildren && isOpened"
      :class="$style.children"
      :channels="state.children"
    />

    <!-- 選択中チャンネルの背景 -->
    <div :class="$style.selectedBg" v-if="state.isSelected" />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  SetupContext,
  computed,
  reactive,
  PropType,
  Ref
} from '@vue/composition-api'
import store from '@/store'
import { ChannelTreeNode } from '@/store/domain/channelTree/state'
import { ChannelId } from '@/types/entity-ids'
import useChannelPath from '@/use/channelPath'
import ChannelElementHash from './ChannelElementHash.vue'
import { deepSome } from '@/lib/util/tree'
import { Channel } from '@traptitech/traq'
import Icon from '@/components/UI/Icon.vue'

const useAncestorPath = (skippedAncestorNames?: string[]) => {
  return {
    path: computed(() => skippedAncestorNames?.join('/')?.concat('/') ?? '')
  }
}

const useFullPath = (props: TypedProps) => {
  const { channelIdToPathString } = useChannelPath()
  return {
    path: computed(() => channelIdToPathString(props.channel.id))
  }
}

const useShortenedPath = (props: TypedProps) => {
  const { channelIdToShortPathString } = useChannelPath()
  return {
    path: computed(() => channelIdToShortPathString(props.channel.id))
  }
}

const useChannelClick = (
  context: SetupContext,
  id: ChannelId,
  isChildShown: Ref<boolean>
) => {
  const onChannelNameClick = () => context.emit('channel-select', id)
  const onChannelHashClick = () => {
    context.emit(
      isChildShown.value ? 'channel-folding-toggle' : 'channel-select',
      id
    )
  }
  return {
    onChannelHashClick,
    onChannelNameClick
  }
}

const useNotification = (props: TypedProps) => {
  const unreadChannel = computed(
    () => store.state.domain.me.unreadChannelsSet[props.channel.id]
  )

  const notificationState = reactive({
    hasNotification: computed(() => !!unreadChannel.value),
    hasNotificationOnChild: computed(() =>
      props.ignoreChildren
        ? false
        : deepSome(
            props.channel,
            channel => channel.id in store.state.domain.me.unreadChannelsSet
          )
    ),
    unreadCount: computed(() => {
      const count = unreadChannel.value?.count ?? 0
      return count === 0 ? undefined : count > 99 ? '99+' : '' + count
    }),
    isNoticeable: computed(() => unreadChannel.value?.noticeable)
  })
  return notificationState
}

const useTopic = (props: TypedProps) => {
  const topic = computed(() =>
    props.showTopic
      ? store.state.entities.channels[props.channel.id]?.topic ?? ''
      : ''
  )
  return { topic }
}

const useRTCState = (props: TypedProps) => {
  const isQalling = computed(
    () => !!store.getters.app.rtc.channelRTCSessionId('qall', props.channel.id)
  )
  return { isQalling }
}

interface Props {
  channel: ChannelTreeNode | Channel
  isOpened: boolean
  ignoreChildren: boolean
  showShortenedPath: boolean
  showTopic: boolean
}

interface WithChildrenProps extends Props {
  channel: ChannelTreeNode
  ignoreChildren: false
}

interface IgnoreChildrenProps extends Props {
  channel: Channel
  showShortenedPath: true
  ignoreChildren: true
}

type TypedProps = WithChildrenProps | IgnoreChildrenProps

export default defineComponent({
  name: 'ChannelElement',
  components: {
    // 型エラー・コンポーネント循環参照の回避
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ChannelList: (() => import('./ChannelList.vue')) as any,
    ChannelElementHash,
    Icon
  },
  props: {
    /** 対象チャンネル */
    channel: {
      type: Object as PropType<ChannelTreeNode | Channel>,
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
    },
    showShortenedPath: {
      type: Boolean,
      default: false
    },
    showTopic: {
      type: Boolean,
      default: false
    }
  },
  setup(props, context) {
    const typedProps = props as TypedProps

    const state = reactive({
      children: computed(() => typedProps.channel.children ?? []),
      hasChild: computed((): boolean => state.children.length > 0),
      isInactive: computed(
        () => !typedProps.ignoreChildren && !typedProps.channel.active
      ),
      isSelected: computed(
        () =>
          store.state.domain.messagesView.currentChannelId ===
          typedProps.channel.id
      )
    })
    const isChildShown = computed(() => !props.ignoreChildren && state.hasChild)

    const pathToShow = computed(() =>
      typedProps.showShortenedPath
        ? useShortenedPath(typedProps).path.value
        : useAncestorPath(typedProps.channel.skippedAncestorNames).path.value +
          typedProps.channel.name
    )
    const pathTooltip = computed(() =>
      typedProps.showShortenedPath
        ? `#${useFullPath(typedProps).path.value}`
        : undefined
    )
    const { onChannelHashClick, onChannelNameClick } = useChannelClick(
      context,
      typedProps.channel.id,
      isChildShown
    )
    const notificationState = useNotification(typedProps)
    const { topic } = useTopic(typedProps)
    const { isQalling } = useRTCState(typedProps)

    return {
      state,
      pathToShow,
      pathTooltip,
      notificationState,
      topic,
      isQalling,
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
$topicLeftPadding: 40px;

.container {
  @include color-ui-primary;
  display: block;
  user-select: none;
  position: relative;
  &[aria-selected='true'] {
    @include color-accent-primary;
  }
}
.channel {
  display: flex;
  align-items: center;
  position: relative;
  height: $elementHeight;
  padding-right: 4px;
  margin-left: $bgLeftShift;
  z-index: 0;
  &[data-is-inactive='true'] {
    @include color-ui-secondary;
  }
}
.channelHash {
  flex-shrink: 0;
  cursor: pointer;
}
.channelName {
  @include size-body1;
  display: flex;
  align-items: center;
  width: 100%;
  min-width: 0;
  height: 100%;
  padding: 0 8px;
  cursor: pointer;
  // > .channelで絞らないと子チャンネルに影響が出る
  .container[aria-selected='true'] > .channel & {
    font-weight: bold;
  }
}
.channelNameString {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.channelNameIcon {
  flex-shrink: 0;
  margin: {
    left: 8px;
    bottom: 2px;
  }
  opacity: 0.5;
}
.unreadBadge {
  color: $theme-background-secondary;
  background: $theme-ui-secondary;
  padding: 0 4px;
  min-width: 24px;
  flex-shrink: 0;
  border-radius: 4px;
  text-align: center;
  cursor: pointer;
  &[data-is-noticeable] {
    background: $theme-accent-notification;
  }
}
.children {
  display: block;
  position: relative;
  z-index: 0;
  margin-left: 20px;
}
.selectedBg {
  @include background-accent-primary;
  position: absolute;
  width: calc(100% + #{$bgLeftShift});
  height: $bgHeight;
  top: -($bgHeight - $elementHeight)/2;
  left: 0;
  z-index: 0;
  border-top-left-radius: 100vw;
  border-bottom-left-radius: 100vw;
  opacity: 0.1;
  pointer-events: none;
}
.topic {
  @include size-body2;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;

  padding: {
    left: $topicLeftPadding + $bgLeftShift;
    right: 8px;
  }
  cursor: pointer;
}
</style>
