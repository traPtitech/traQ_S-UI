<template>
  <OptionalRouterLink :class="$style.container" :to="dmChannelPath" block>
    <div :class="$style.title">
      <UserName :class="$style.name" :user="user" is-title />
      <NotificationIndicator :class="$style.indicator" />
    </div>
    <div :class="$style.separator" />
    <div :class="$style.content">DMのため非表示</div>
  </OptionalRouterLink>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import UserName from '/@/components/UI/MessagePanel/UserName.vue'
import NotificationIndicator from '/@/components/UI/NotificationIndicator.vue'
import OptionalRouterLink from '/@/components/UI/OptionalRouterLink.vue'
import { constructUserPath } from '/@/router'
import { useUsersStore } from '/@/store/entities/users'
import type { UserId } from '/@/types/entity-ids'

const props = defineProps<{
  userId: UserId
}>()

const { usersMap } = useUsersStore()
const user = computed(() => usersMap.value.get(props.userId))
const dmChannelPath = computed(() =>
  user.value ? constructUserPath(user.value.name) : undefined
)
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
  @include color-ui-primary-inactive;
}
</style>
