<template>
  <div v-if="user" :class="$style.container">
    <!-- チャンネル表示本体 -->
    <div
      :class="$style.channel"
      @mousedown="openChannel"
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
      <d-m-channel-element-name :name="user.name" />
      <channel-element-unread-badge
        is-noticeable
        :unread-count="notificationState.unreadCount"
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

<script lang="ts" setup>
import { computed, toRef } from 'vue'
import useHover from '/@/composables/useHover'
import { DMChannel } from '@traptitech/traq'
import { useUsersStore } from '/@/store/entities/users'
import ChannelElementUnreadBadge from '/@/components/Main/NavigationBar/ChannelList/ChannelElementUnreadBadge.vue'
import UserIcon from '/@/components/UI/UserIcon.vue'
import DMChannelElementName from './DMChannelElementName.vue'
import useNotificationState from '../composables/useNotificationState'
import useChannelPath from '/@/composables/useChannelPath'
import { useOpenLink } from '/@/composables/useOpenLink'

const props = defineProps<{
  dmChannel: DMChannel
}>()

const { usersMap } = useUsersStore()
const user = computed(() => usersMap.value.get(props.dmChannel.userId))

const notificationState = useNotificationState(toRef(props, 'dmChannel'))

const { openLink } = useOpenLink()
const { channelIdToLink } = useChannelPath()
const openChannel = (event: MouseEvent) => {
  openLink(event, channelIdToLink(props.dmChannel.id))
}

const { isHovered, onMouseEnter, onMouseLeave } = useHover()
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
    background: $theme-ui-primary-background;
  }
}
</style>
