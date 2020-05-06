<template>
  <div :class="$style.container">
    <header-tools-item
      @click="context.emit('click-qall')"
      icon-mdi
      :icon-name="qallIconName"
      :class="$style.qallIcon"
      :disabled="hasActiveQallSession && !isJoinedQallSession"
      :data-is-active="isJoinedQallSession || isQallSessionOpened"
      v-if="isQallEnabled && !isMobile"
    />
    <!-- 遅延ロードをする都合上v-showで切り替える必要がある -->
    <template v-if="!isMobile">
      <header-tools-item
        v-show="currentChannelSubscription === ChannelSubscribeLevel.notified"
        @click="changeToNextSubscriptionLevel"
        icon-name="notified"
      />
      <header-tools-item
        v-show="currentChannelSubscription === ChannelSubscribeLevel.subscribed"
        @click="changeToNextSubscriptionLevel"
        icon-name="subscribed"
      />
      <header-tools-item
        v-show="currentChannelSubscription === ChannelSubscribeLevel.none"
        @click="changeToNextSubscriptionLevel"
        :class="$style.icon"
        icon-mdi
        icon-name="bell-outline"
      />
    </template>
    <header-tools-item
      v-show="isStared"
      @click="context.emit('unstar-channel')"
      icon-name="star"
    />
    <header-tools-item
      v-show="!isStared"
      @click="context.emit('star-channel')"
      icon-name="star-outline"
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
