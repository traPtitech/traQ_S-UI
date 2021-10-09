<template>
  <div v-if="user" :class="$style.container">
    <!-- チャンネル表示本体 -->
    <div
      :class="$style.channel"
      @mouseenter="onMouseEnter"
      @mouseleave="onMouseLeave"
    >
      <div :class="$style.channelHash">
        <user-icon
          has-notification
          prevent-modal
          :user-id="user.id"
          :size="24"
          :indicator-size="8"
        />
      </div>
      <d-m-channel-element-name :name="user.name" @mousedown="onChannelClick" />
      <channel-element-unread-badge
        is-noticeable
        :unread-count="notificationState.unreadCount"
        @mousedown="onChannelClick"
      />
    </div>

    <!-- チャンネルの背景 -->
    <div
      v-if="isHovered"
      :class="$style.selectedBg"
      :data-is-hovered="$boolAttr(isHovered)"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, reactive, PropType } from 'vue'
import store from '/@/store'
import ChannelElementUnreadBadge from '/@/components/Main/Navigation/ChannelList/ChannelElementUnreadBadge.vue'
import useHover from '/@/use/hover'
import { DMChannel } from '@traptitech/traq'
import UserIcon from '/@/components/UI/UserIcon.vue'
import DMChannelElementName from './DMChannelElementName.vue'
import { ChannelId } from '/@/types/entity-ids'

const useNotification = (props: { dmChannel: DMChannel }) => {
  const unreadChannel = computed(() =>
    store.state.domain.me.unreadChannelsMap.get(props.dmChannel.id)
  )

  const notificationState = reactive({
    hasNotification: computed(() => !!unreadChannel.value),
    unreadCount: computed(() => unreadChannel.value?.count)
  })
  return notificationState
}

export default defineComponent({
  name: 'DMChannelElement',
  components: {
    UserIcon,
    DMChannelElementName,
    ChannelElementUnreadBadge
  },
  props: {
    dmChannel: {
      type: Object as PropType<DMChannel>,
      required: true
    }
  },
  emits: {
    channelSelect: (_event: MouseEvent, _channelId: ChannelId) => true
  },
  setup(props, { emit }) {
    const user = computed(() =>
      store.state.entities.usersMap.get(props.dmChannel.userId)
    )
    const notificationState = useNotification(props)

    const onChannelClick = (e: MouseEvent) => {
      emit('channelSelect', e, props.dmChannel.id)
    }

    const { isHovered, onMouseEnter, onMouseLeave } = useHover()

    return {
      user,
      notificationState,
      onChannelClick,
      onMouseEnter,
      onMouseLeave,
      isHovered
    }
  }
})
</script>

<style lang="scss" module>
$elementHeight: 32px;
$bgHeight: 36px;
$bgLeftShift: 8px;
$topicLeftPadding: 40px;

.container {
  @include color-ui-primary;
  display: block;
  user-select: none;
  position: relative;
  contain: layout;
}
.channel {
  display: flex;
  align-items: center;
  position: relative;
  height: $elementHeight;
  padding-right: 4px;
  margin-left: $bgLeftShift;
  z-index: 0;
}
.channelHash {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  width: 32px;
  flex-shrink: 0;
  cursor: pointer;
}
.selectedBg {
  position: absolute;
  width: calc(100% + #{$bgLeftShift});
  height: $bgHeight;
  top: -1 * math.div($bgHeight - $elementHeight, 2);
  left: 0;
  z-index: 0;
  border-top-left-radius: 100vw;
  border-bottom-left-radius: 100vw;
  opacity: 0.1;
  pointer-events: none;

  display: none;
  &[data-is-hovered] {
    display: block;
    background: $theme-ui-primary;
  }
}
</style>
