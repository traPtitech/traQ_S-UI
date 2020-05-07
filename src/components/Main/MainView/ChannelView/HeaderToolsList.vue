<template>
  <div :class="$style.container">
    <template v-if="!isMobile">
      <header-tools-item
        v-if="isQallEnabled"
        @click="context.emit('click-qall')"
        icon-mdi
        :icon-name="qallIconName"
        :class="$style.qallIcon"
        :disabled="hasActiveQallSession && !isJoinedQallSession"
        :data-is-active="isJoinedQallSession || isQallSessionOpened"
      />
      <header-tools-item
        v-if="isForcedChannel"
        icon-name="notified"
        disabled
        tooltip="強制通知チャンネル"
      />
      <header-tools-item
        v-else-if="
          currentChannelSubscription === ChannelSubscribeLevel.notified
        "
        @click="changeToNextSubscriptionLevel"
        icon-name="notified"
        tooltip="通知チャンネル"
      />
      <header-tools-item
        v-else-if="
          currentChannelSubscription === ChannelSubscribeLevel.subscribed
        "
        @click="changeToNextSubscriptionLevel"
        icon-name="subscribed"
        tooltip="未読管理チャンネル"
      />
      <header-tools-item
        v-else-if="currentChannelSubscription === ChannelSubscribeLevel.none"
        @click="changeToNextSubscriptionLevel"
        :class="$style.icon"
        icon-mdi
        icon-name="bell-outline"
        tooltip="未購読チャンネル"
      />
    </template>
    <header-tools-item
      v-if="isStared"
      @click="context.emit('unstar-channel')"
      icon-name="star"
      tooltip="お気に入りから外す"
    />
    <header-tools-item
      v-else
      @click="context.emit('star-channel')"
      icon-name="star-outline"
      tooltip="お気に入りに追加する"
    />
    <!--
    <header-tools-item
      @click="context.emit('click-pin')"
      icon-mdi
      icon-name="pin"
    />
    -->
    <div :class="$style.moreButton">
      <portal-target :class="$style.popupLocator" :name="targetPortalName" />
      <header-tools-item
        @click="context.emit('click-more')"
        icon-mdi
        icon-name="dots-horizontal"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, SetupContext, computed } from '@vue/composition-api'
import useChannelSubscriptionState from '@/use/channelSubscriptionState'
import HeaderToolsItem from '@/components/Main/MainView/MainViewHeader/MainViewHeaderToolsItem.vue'
import store from '@/store'
import { ChannelSubscribeLevel } from '@traptitech/traq'
import useIsMobile from '@/use/isMobile'

export const targetPortalName = 'header-popup'

export default defineComponent({
  name: 'ChannelViewHeaderTools',
  components: {
    HeaderToolsItem
  },
  props: {
    isStared: { type: Boolean, default: false },
    isForcedChannel: { type: Boolean, default: false },
    hasActiveQallSession: { type: Boolean, default: false },
    isQallSessionOpened: { type: Boolean, default: false },
    isJoinedQallSession: { type: Boolean, default: false }
  },
  setup(props, context: SetupContext) {
    const {
      changeToNextSubscriptionLevel,
      currentChannelSubscription
    } = useChannelSubscriptionState()

    const isQallEnabled = computed(() => store.state.app.rtcSettings.isEnabled)

    const qallIconName = computed(() =>
      props.isJoinedQallSession ? 'phone' : 'phone-outline'
    )

    const { isMobile } = useIsMobile()

    return {
      qallIconName,
      context,
      currentChannelSubscription,
      changeToNextSubscriptionLevel,
      targetPortalName,
      isQallEnabled,
      ChannelSubscribeLevel,
      isMobile
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
  &[data-is-active] {
    color: $common-ui-qall;
  }
}
</style>
