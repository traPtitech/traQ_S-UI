<template>
  <div :class="$style.container" @click="onClick">
    <div :class="$style.title">
      <user-name :class="$style.name" :user="user" is-title />
      <notification-indicator :class="$style.indicator" />
    </div>
    <div :class="$style.separator" />
    <div :class="$style.content">DMのため非表示</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue'
import store from '/@/store'
import { UserId } from '/@/types/entity-ids'
import UserName from '/@/components/UI/MessagePanel/UserName.vue'
import NotificationIndicator from '/@/components/UI/NotificationIndicator.vue'
import { changeDMChannelByUsername } from '/@/router/channel'

export default defineComponent({
  name: 'DMActivityElement',
  components: {
    UserName,
    NotificationIndicator
  },
  props: {
    userId: {
      type: String as PropType<UserId>,
      required: true
    }
  },
  setup(props) {
    const user = computed(() => store.state.entities.usersMap.get(props.userId))

    const onClick = () => {
      if (!user.value) return
      changeDMChannelByUsername(user.value.name)
    }

    return { user, onClick }
  }
})
</script>

<style lang="scss" module>
.container {
  @include background-primary;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
}
.title {
  display: flex;
  align-items: center;
}
.name {
  flex: 1;
}
.indicator {
  margin-left: 8px;
}
.separator {
  @include background-secondary;
  width: 100%;
  height: 2px;
  margin: 4px 0;
}
.content {
  opacity: 0.5;
}
</style>
