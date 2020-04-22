<template>
  <div :class="$style.container">
    <main-view-header-tools-item
      @click="context.emit('click-qall')"
      icon-mdi
      icon-name="phone"
    />
    <main-view-header-tools-item
      @click="context.emit('click-pin')"
      icon-mdi
      icon-name="pin"
    />
    <!-- 遅延ロードをする都合上v-showで切り替える必要がある -->
    <main-view-header-tools-item
      v-show="currentChannelSubscription === 'notified'"
      @click="changeToNextSubscriptionLevel"
      icon-mdi
      icon-name="bell"
    />
    <main-view-header-tools-item
      v-show="currentChannelSubscription === 'subscribed'"
      @click="changeToNextSubscriptionLevel"
      icon-name="subscribed"
    />
    <main-view-header-tools-item
      v-show="currentChannelSubscription === 'none'"
      @click="changeToNextSubscriptionLevel"
      :class="$style.icon"
      icon-mdi
      icon-name="bell-outline"
    />
    <main-view-header-tools-item
      v-show="isStared"
      @click="context.emit('unstar-channel')"
      icon-name="star"
    />
    <main-view-header-tools-item
      v-show="!isStared"
      @click="context.emit('star-channel')"
      icon-name="star-outline"
    />
    <div :class="$style.moreButton">
      <portal-target :class="$style.popupLocator" :name="targetPortalName" />
      <main-view-header-tools-item
        @click="context.emit('click-more')"
        icon-mdi
        icon-name="dots-horizontal"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, SetupContext, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import useChannelSubscriptionState from '@/use/channelSubscriptionState'
import MainViewHeaderToolsItem from './MainViewHeaderToolsItem.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.primary,
      color: theme.ui.primary,
      borderBottom: `2px solid ${theme.ui.tertiary}`
    }))
  })

export const targetPortalName = 'header-popup'

export default defineComponent({
  name: 'MainViewHeaderTools',
  components: {
    MainViewHeaderToolsItem
  },
  props: { isStared: { type: Boolean, default: false } },
  setup(_, context: SetupContext) {
    const {
      changeToNextSubscriptionLevel,
      currentChannelSubscription
    } = useChannelSubscriptionState()
    return {
      context,
      currentChannelSubscription,
      changeToNextSubscriptionLevel,
      targetPortalName
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
