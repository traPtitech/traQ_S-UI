<template>
  <div :class="$style.container">
    <template v-if="!isMobile">
      <header-tools-item
        v-if="true"
        icon-mdi
        :icon-name="isCallingHere ? 'phone' : 'phone-outline'"
        :class="$style.qallIcon"
        :disabled="disabled"
        :data-is-active="$boolAttr(isCallingHere)"
        :data-is-joined="$boolAttr(isCallingHere)"
        :tooltip="'Qallボタン'"
        @click="joinQall(props.channelId)"
      />
      <header-tools-item
        :class="$style.notificationIcon"
        :data-state="subscriptionChangeInfo.state"
        :icon-name="subscriptionChangeInfo.iconName"
        :disabled="!subscriptionChangeInfo.canChange"
        :tooltip="subscriptionChangeInfo.tooltip"
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
    <div :class="$style.moreButton">
      <slot />
      <header-tools-item
        :class="$style.icon"
        icon-mdi
        icon-name="dots-horizontal"
        @click="emit('clickMore')"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRef } from 'vue'
import useChannelSubscriptionState from '/@/composables/subscription/useChannelSubscriptionState'
import { ChannelSubscribeLevel } from '@traptitech/traq'
import { useResponsiveStore } from '/@/store/ui/responsive'
import type { ChannelId } from '/@/types/entity-ids'
import HeaderToolsItem from '/@/components/Main/MainView/PrimaryViewHeader/PrimaryViewHeaderToolsItem.vue'
import useStarChannel from './composables/useStarChannel'
import { useQall } from '/@/composables/qall/useQall'

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
  (e: 'clickMore'): void
}>()

const { isMobile } = useResponsiveStore()

const { joinQall, callingChannel } = useQall()
const isCallingHere = computed(() => callingChannel.value === props.channelId)
const disabled = computed(() => !!callingChannel.value && !isCallingHere.value)

const { changeToNextSubscriptionLevel, currentChannelSubscription } =
  useChannelSubscriptionState(toRef(props, 'channelId'))
const subscriptionChangeInfo = computed(() => {
  if (props.isForcedChannel) {
    return {
      state: 'forced',
      iconName: 'forced',
      tooltip: '強制通知チャンネル',
      canChange: false
    }
  }
  switch (currentChannelSubscription.value) {
    case ChannelSubscribeLevel.notified:
      return {
        state: 'notified',
        iconName: 'notified',
        tooltip: '通知チャンネル',
        canChange: true
      }
    case ChannelSubscribeLevel.subscribed:
      return {
        state: 'subscribed',
        iconName: 'subscribed',
        tooltip: '未読管理チャンネル',
        canChange: true
      }
    case ChannelSubscribeLevel.none:
      return {
        state: 'none',
        iconName: 'not-subscribed',
        tooltip: '未購読チャンネル',
        canChange: true
      }
  }
  const check: never = currentChannelSubscription.value
  throw new Error(`Unknown subscribe level: ${check}`)
})

const { starChannel, unstarChannel } = useStarChannel(props)
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
