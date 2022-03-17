<template>
  <div :class="$style.container">
    <template v-if="!isMobile">
      <header-tools-item
        v-if="isQallFeatureEnabled"
        icon-mdi
        :icon-name="qallIconName"
        :class="$style.qallIcon"
        :disabled="!canToggleQall"
        :data-is-active="$boolAttr(isQallSessionOpened)"
        :data-is-joined="$boolAttr(canEndQall)"
        :tooltip="qallLabel"
        @click="toggleQall"
      />
      <header-tools-item
        v-if="isForcedChannel"
        :class="$style.notificationIcon"
        data-state="forced"
        icon-name="forced"
        disabled
        tooltip="強制通知チャンネル"
      />
      <header-tools-item
        v-else-if="
          currentChannelSubscription === ChannelSubscribeLevel.notified
        "
        :class="$style.notificationIcon"
        data-state="notified"
        icon-name="notified"
        tooltip="通知チャンネル"
        @click="changeToNextSubscriptionLevel"
      />
      <header-tools-item
        v-else-if="
          currentChannelSubscription === ChannelSubscribeLevel.subscribed
        "
        :class="$style.notificationIcon"
        data-state="subscribed"
        icon-name="subscribed"
        tooltip="未読管理チャンネル"
        @click="changeToNextSubscriptionLevel"
      />
      <header-tools-item
        v-else-if="currentChannelSubscription === ChannelSubscribeLevel.none"
        :class="$style.notificationIcon"
        data-state="none"
        icon-name="not-subscribed"
        tooltip="未購読チャンネル"
        @click="changeToNextSubscriptionLevel"
      />
    </template>
    <header-tools-item
      v-if="isStared"
      :class="$style.starIcon"
      data-is-stared
      icon-name="star"
      tooltip="お気に入りから外す"
      @click="unstarChannel"
    />
    <header-tools-item
      v-else
      :class="$style.starIcon"
      icon-name="star-outline"
      tooltip="お気に入りに追加する"
      @click="starChannel"
    />
    <!--
    <header-tools-item
      @click="clickPin"
      :class="$style.icon"
      icon-mdi
      icon-name="pin"
    />
    -->
    <div :class="$style.moreButton">
      <slot />
      <header-tools-item
        :class="$style.icon"
        icon-mdi
        icon-name="dots-horizontal"
        @click="clickMore"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { toRef } from 'vue'
import useChannelSubscriptionState from '/@/composables/useChannelSubscriptionState'
import { ChannelSubscribeLevel } from '@traptitech/traq'
import { useResponsiveStore } from '/@/store/ui/responsive'
import { ChannelId } from '/@/types/entity-ids'
import HeaderToolsItem from '/@/components/Main/MainView/MainViewHeader/MainViewHeaderToolsItem.vue'
import useQall from './composables/useQall'

const props = withDefaults(
  defineProps<{
    channelId: ChannelId
    isStared?: boolean
    isForcedChannel?: boolean
    isArchived?: boolean
  }>(),
  {
    isStared: false,
    isForcedChannel: false,
    isArchived: false
  }
)

const emit = defineEmits<{
  (e: 'starChannel'): void
  (e: 'unstarChannel'): void
  (e: 'clickMore'): void
}>()

const {
  isQallFeatureEnabled,
  isQallSessionOpened,
  canEndQall,
  canToggleQall,
  qallIconName,
  qallLabel,
  toggleQall
} = useQall(props)

const { changeToNextSubscriptionLevel, currentChannelSubscription } =
  useChannelSubscriptionState(toRef(props, 'channelId'))

const { isMobile } = useResponsiveStore()

const starChannel = () => {
  emit('starChannel')
}
const unstarChannel = () => {
  emit('unstarChannel')
}
const clickMore = () => {
  emit('clickMore')
}
</script>

<style lang="scss" module>
.container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}
.moreButton {
  position: relative;
  display: inline;
}
.popupLocator {
  position: absolute;
  right: 0;
  top: 100%;
}
.qallIcon {
  transition: transform 0.1s;
  &[data-is-active] {
    color: $common-ui-qall;
  }
  &[data-is-joined] {
    animation: shake 0.2s 2;
  }
  &:hover {
    transform: scale(1.1);
  }
}
.notificationIcon {
  transition: transform 0.1s;
  &[data-state='notified'] {
    animation: shake 0.2s 2;
  }
  &:hover {
    transform: scale(1.1);
  }
}
.starIcon {
  transition: transform 0.1s;
  &[data-is-stared] {
    animation: spinAndPress 0.5s;
  }
  &:hover {
    transform: scale(1.1);
  }
}
.icon {
  transition: transform 0.1s;
  &:hover {
    transform: scale(1.1);
  }
}

@keyframes shake {
  0% {
    transform: scale(1.1) rotate(0deg);
  }
  25% {
    transform: scale(1.1) rotate(-10deg);
  }
  75% {
    transform: scale(1.1) rotate(10deg);
  }
  100% {
    transform: scale(1.1) rotate(0deg);
  }
}

@keyframes spinAndPress {
  0% {
    transform: scale(1.1) rotate(0deg);
  }
  60% {
    transform: scale(1.1) rotate(360deg);
  }
  80% {
    transform: scale(1.3) rotate(360deg);
  }
  100% {
    transform: scale(1.1) rotate(360deg);
  }
}
</style>
