<template>
  <div :class="$style.user">
    <div :class="$style.bar" />
    <user-icon :user-id="userId" :size="20" />
    <div :class="$style.displayName">{{ userDisplayName }}</div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import store from '@/store'
import UserIcon from '@/components/UI/UserIcon.vue'
import { UserId } from '@/types/entity-ids'

export default defineComponent({
  name: 'SidebarEventChangedUser',
  components: {
    UserIcon
  },
  props: {
    userId: {
      type: String as PropType<UserId>,
      required: true
    }
  },
  setup(props) {
    const userDisplayName = computed(
      () =>
        store.state.entities.usersMap.get(props.userId)?.displayName ??
        'unknown'
    )
    return { userDisplayName }
  }
})
</script>

<style lang="scss" module>
.user {
  display: flex;
  align-items: center;
}
.bar {
  @include background-secondary;
  width: 16px;
  height: 2px;
  margin-right: 8px;
  flex-shrink: 0;
}
.displayName {
  flex: 1;
  margin-left: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
