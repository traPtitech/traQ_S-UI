<template>
  <div :class="$style.container" @click="onClick">
    <user-icon
      :class="$style.icon"
      :user-id="user.id"
      :size="36"
      :has-notification="hasNotification"
    />
    <users-element-user-name :user="user" />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import { User } from '@traptitech/traq'
import UserIcon from '/@/components/UI/UserIcon.vue'
import UsersElementUserName from './UsersElementUserName.vue'
import store from '/@/store'
import { changeDMChannelByUsername } from '/@/router/channel'

export default defineComponent({
  name: 'UsersElement',
  components: {
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
    const dmChannelId = computed(() =>
      store.getters.entities.DMChannelIdByUserId(props.user.id)
    )
    const hasNotification = computed(() =>
      store.state.domain.me.unreadChannelsMap.has(dmChannelId.value ?? '')
    )

    const onClick = () => {
      if (props.user.bot && props.user.name.startsWith('Webhook#')) {
        return
      }
      changeDMChannelByUsername(props.user.name)
    }

    return { hasNotification, onClick }
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-tertiary;
  display: flex;
  align-items: center;
  padding: 2px;
  cursor: pointer;
}
.icon {
  margin-right: 16px;
}
</style>
