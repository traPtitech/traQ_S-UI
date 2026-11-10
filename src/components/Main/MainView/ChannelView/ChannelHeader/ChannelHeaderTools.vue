<template>
  <PrimaryViewHeaderTools
    :notification="subscriptionChangeInfo"
    :is-starred="channelState.starred"
    @click-notification="changeToNextSubscriptionLevel"
    @click-star="channelState.starred ? unstarChannel() : starChannel()"
  >
    <template #leading>
      <HeaderToolsItem
        hover-scale
        icon-mdi
        :icon-name="isCallingHere ? 'phone' : 'phone-outline'"
        :class="$style.qallIcon"
        :animation="isCallingHere ? 'shake' : undefined"
        :disabled="disabled"
        :data-is-active="$boolAttr(isCallingHere)"
        :data-is-joined="$boolAttr(isCallingHere)"
        tooltip="Qallボタン"
        @click="joinQall(channelId)"
      />
    </template>
    <template #menu="{ close }">
      <ChannelHeaderToolsMenu
        :channel-id="channelId"
        :show-notification-setting-btn="!channelState.forced"
        :is-starred="channelState.starred"
        :is-archived="channelState.archived"
        @click-item="close"
      />
    </template>
  </PrimaryViewHeaderTools>
</template>

<script lang="ts" setup>
import { ChannelSubscribeLevel } from '@traptitech/traq'

import { computed, toRef } from 'vue'

import PrimaryViewHeaderTools from '/@/components/Main/MainView/PrimaryViewHeader/PrimaryViewHeaderTools.vue'
import HeaderToolsItem from '/@/components/Main/MainView/PrimaryViewHeader/PrimaryViewHeaderToolsItem.vue'
import { useQall } from '/@/composables/qall/useQall'
import useChannelSubscriptionState from '/@/composables/subscription/useChannelSubscriptionState'
import type { ChannelId } from '/@/types/entity-ids'

import ChannelHeaderToolsMenu from './ChannelHeaderToolsMenu.vue'
import useChannelState from './composables/useChannelState'
import useStarChannel from './composables/useStarChannel'

const props = defineProps<{
  channelId: ChannelId
}>()

const { channelState } = useChannelState(props)
const { starChannel, unstarChannel } = useStarChannel(props)
const { joinQall, callingChannel } = useQall()
const isCallingHere = computed(() => callingChannel.value === props.channelId)
const disabled = computed(() => !!callingChannel.value && !isCallingHere.value)

const { changeToNextSubscriptionLevel, currentChannelSubscription } =
  useChannelSubscriptionState(toRef(props, 'channelId'))
const subscriptionChangeInfo = computed(() => {
  if (channelState.forced) {
    return {
      state: 'forced',
      iconName: 'forced',
      tooltip: '強制通知チャンネル',
      disabled: true
    }
  }
  switch (currentChannelSubscription.value) {
    case ChannelSubscribeLevel.notified:
      return {
        state: 'notified',
        iconName: 'notified',
        tooltip: '通知チャンネル'
      }
    case ChannelSubscribeLevel.subscribed:
      return {
        state: 'subscribed',
        iconName: 'subscribed',
        tooltip: '未読管理チャンネル'
      }
    case ChannelSubscribeLevel.none:
      return {
        state: 'none',
        iconName: 'not-subscribed',
        tooltip: '未購読チャンネル'
      }
  }
  const check: never = currentChannelSubscription.value
  throw new Error(`Unknown subscribe level: ${check}`)
})
</script>

<style lang="scss" module>
.qallIcon {
  &[data-is-active] {
    color: $common-ui-qall;
  }
}
</style>
