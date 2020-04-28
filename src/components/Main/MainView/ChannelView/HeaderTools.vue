<template>
  <div :class="$style.container">
    <header-tools-item
      @click="context.emit('click-qall')"
      icon-mdi
      :icon-name="qallIconName"
      :style="styles.qallIcon"
      :disabled="
        (hasActiveQallSession && !isJoinedQallSession) || !state.isEnableQall
      "
    />
    <header-tools-item
      @click="context.emit('click-pin')"
      icon-mdi
      icon-name="pin"
    />
    <!-- 遅延ロードをする都合上v-showで切り替える必要がある -->
    <header-tools-item
      v-show="currentChannelSubscription === 'notified'"
      @click="changeToNextSubscriptionLevel"
      icon-mdi
      icon-name="bell"
    />
    <header-tools-item
      v-show="currentChannelSubscription === 'subscribed'"
      @click="changeToNextSubscriptionLevel"
      icon-name="subscribed"
    />
    <header-tools-item
      v-show="currentChannelSubscription === 'none'"
      @click="changeToNextSubscriptionLevel"
      :class="$style.icon"
      icon-mdi
      icon-name="bell-outline"
    />
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
import {
  defineComponent,
  SetupContext,
  computed,
  reactive
} from '@vue/composition-api'

import useChannelSubscriptionState from '@/use/channelSubscriptionState'
import HeaderToolsItem from './HeaderToolsItem.vue'
import store from '@/store'
import { makeStyles } from '@/lib/styles'

export const targetPortalName = 'header-popup'

const useStyles = (
  props: {
    isQallSessionOpened: boolean
    isJoinedQallSession: boolean
  },
  state: { isEnableQall: boolean }
) =>
  reactive({
    qallIcon: makeStyles((_, common) => ({
      color:
        props.isJoinedQallSession || props.isQallSessionOpened
          ? common.ui.qall
          : '',
      display: state.isEnableQall ? '' : `none`
    }))
  })

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

    const state = reactive({
      isEnableQall: computed(() => store.state.app.rtcSettings.isEnabled)
    })

    const styles = useStyles(props, state)
    const qallIconName = computed(() =>
      props.isJoinedQallSession ? 'phone' : 'phone-outline'
    )

    return {
      styles,
      qallIconName,
      context,
      currentChannelSubscription,
      changeToNextSubscriptionLevel,
      targetPortalName,
      state
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
</style>
