<template>
  <div :class="$style.container">
    <user-icon
      :class="$style.icon"
      :user-id="user.id"
      :size="36"
      :has-notification="hasNotification"
    />
    <optional-router-link :to="dmChannelPath" block>
      <users-element-user-name :user="user" />
    </optional-router-link>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import { User } from '@traptitech/traq'
import UserIcon from '/@/components/UI/UserIcon.vue'
import UsersElementUserName from './UsersElementUserName.vue'
import store from '/@/store'
import OptionalRouterLink from '/@/components/UI/OptionalRouterLink.vue'
import { constructUserPath } from '/@/router'

export default defineComponent({
  name: 'UsersElement',
  components: {
    OptionalRouterLink,
    UsersElementUserName,
    UserIcon
  },
  props: {
    user: {
      type: Object as PropType<User>,
      required: true
    }
  },
  setup(props) {
    const dmChannelPath = computed(() => {
      if (props.user.bot && props.user.name.startsWith('Webhook#')) {
        return
      }
      return constructUserPath(props.user.name)
    })
    const dmChannelId = computed(() =>
      store.getters.entities.DMChannelIdByUserId(props.user.id)
    )
    const hasNotification = computed(() =>
      store.state.domain.me.unreadChannelsMap.has(dmChannelId.value ?? '')
    )

    return { dmChannelPath, hasNotification }
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-tertiary;
  display: flex;
  align-items: center;
  padding: 2px;
}
.icon {
  margin-right: 16px;
}
</style>
