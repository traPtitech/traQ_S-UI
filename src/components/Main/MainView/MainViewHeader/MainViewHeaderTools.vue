<template>
  <div>
    <icon
      @click="context.emit('click-qall')"
      :class="$style.icon"
      mdi
      name="phone"
    />
    <icon
      @click="context.emit('click-pin')"
      :class="$style.icon"
      mdi
      name="pin"
    />
    <!-- 遅延ロードをする都合上v-showで切り替える必要がある -->
    <icon
      v-show="currentChannelSubscription === 'notified'"
      @click="changeToNextSubscriptionLevel"
      :class="$style.icon"
      mdi
      name="bell"
    />
    <icon
      v-show="currentChannelSubscription === 'subscribed'"
      @click="changeToNextSubscriptionLevel"
      :class="$style.icon"
      name="subscribed"
    />
    <icon
      v-show="currentChannelSubscription === 'none'"
      @click="changeToNextSubscriptionLevel"
      :class="$style.icon"
      mdi
      name="bell-outline"
    />
    <icon
      v-show="isStared"
      @click="context.emit('unstar-channel')"
      :class="$style.icon"
      name="star"
    />
    <icon
      v-show="!isStared"
      @click="context.emit('star-channel')"
      :class="$style.icon"
      name="star-outline"
    />
    <div :class="$style.moreButton">
      <portal-target :class="$style.popupLocator" :name="targetPortalName" />
      <icon
        @click="context.emit('click-more')"
        :class="$style.icon"
        mdi
        name="dots-horizontal"
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
import { ChannelId } from '@/types/entity-ids'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import Icon from '@/components/UI/Icon.vue'
import MainViewHeaderChannelName from './MainViewHeaderChannelName.vue'
import useChannelSubscriptionState from '@/use/channelSubscriptionState'

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
    Icon
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
  padding: 16px;
}
.icon {
  margin: 8px;
  cursor: pointer;
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
