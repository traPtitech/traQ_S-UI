<template>
  <div :class="$style.container">
    <user-icon :user-id="userId" />
    <span :class="$style.name">{{ name }}</span>
    <a-toggle v-model="value" />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import store from '/@/store'
import { UserId } from '/@/types/entity-ids'
import AToggle from '/@/components/UI/AToggle.vue'
import UserIcon from '/@/components/UI/UserIcon.vue'

export default defineComponent({
  name: 'UserNotificationListItem',
  components: {
    AToggle,
    UserIcon
  },
  props: {
    userId: {
      type: String as PropType<UserId>,
      required: true
    },
    subscribed: {
      type: Boolean,
      required: true
    }
  },
  emits: {
    changeNotification: (_userId: UserId, _val: boolean) => true
  },
  setup(props, { emit }) {
    const value = computed({
      get: () => props.subscribed,
      set: _v => {
        emit('changeNotification', props.userId, !props.subscribed)
      }
    })
    const name = computed(
      () => store.state.entities.usersMap.get(props.userId)?.name ?? ''
    )
    return { value, name }
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-primary;
  display: grid;
  grid-template-columns: 36px 1fr 44px;
  column-gap: 8px;
  align-items: center;
  width: 100%;
  height: 36px;
}
.name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
