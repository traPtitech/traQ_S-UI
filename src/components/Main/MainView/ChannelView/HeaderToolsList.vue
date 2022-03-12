<template>
  <div :class="$style.container">
    <template v-if="!isMobile">
      <header-tools-item
        v-if="isQallEnabled"
        icon-mdi
        :icon-name="qallIconName"
        :class="$style.qallIcon"
        :disabled="
          isArchived ||
          (hasActiveQallSession &&
            (!isJoinedQallSession || !isJoinedWithCurrentDevice))
        "
        :data-is-active="$boolAttr(isQallSessionOpened)"
        :data-is-joined="$boolAttr(isJoinedQallSession)"
        :tooltip="
          isJoinedQallSession && !isJoinedWithCurrentDevice
            ? '別のデバイスでQall中'
            : undefined
        "
        @click="clickQall"
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
      <div :id="teleportTargetName" :class="$style.popupLocator" />
      <header-tools-item
        :class="$style.icon"
        icon-mdi
        icon-name="dots-horizontal"
        @click="clickMore"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import useChannelSubscriptionState from '/@/use/channelSubscriptionState'
import HeaderToolsItem from '/@/components/Main/MainView/MainViewHeader/MainViewHeaderToolsItem.vue'
import { ChannelSubscribeLevel } from '@traptitech/traq'
import { useResponsiveStore } from '/@/store/ui/responsive'
import { useRtcSettings } from '/@/store/app/rtcSettings'

const isSkywayApikeySet = window.traQConfig.skyway !== undefined

export const teleportTargetName = 'header-popup'

export default defineComponent({
  name: 'HeaderToolsList',
  components: {
    HeaderToolsItem
  },
  props: {
    isStared: { type: Boolean, default: false },
    isForcedChannel: { type: Boolean, default: false },
    hasActiveQallSession: { type: Boolean, default: false },
    isQallSessionOpened: { type: Boolean, default: false },
    isJoinedQallSession: { type: Boolean, default: false },
    isJoinedWithCurrentDevice: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false }
  },
  emits: {
    clickQall: () => true,
    starChannel: () => true,
    unstarChannel: () => true,
    clickMore: () => true
  },
  setup(props, { emit }) {
    const { isEnabled: isRtcEnabled } = useRtcSettings()
    const { changeToNextSubscriptionLevel, currentChannelSubscription } =
      useChannelSubscriptionState()

    const isQallEnabled = computed(
      () => isSkywayApikeySet && isRtcEnabled.value
    )

    const qallIconName = computed(() =>
      props.isJoinedQallSession ? 'phone' : 'phone-outline'
    )

    const { isMobile } = useResponsiveStore()

    const clickQall = () => {
      emit('clickQall')
    }
    const starChannel = () => {
      emit('starChannel')
    }
    const unstarChannel = () => {
      emit('unstarChannel')
    }
    const clickMore = () => {
      emit('clickMore')
    }

    return {
      qallIconName,
      currentChannelSubscription,
      changeToNextSubscriptionLevel,
      teleportTargetName,
      isQallEnabled,
      ChannelSubscribeLevel,
      isMobile,
      clickQall,
      starChannel,
      unstarChannel,
      clickMore
    }
  }
})
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
