<template>
  <div :class="$style.header">
    <span :class="$style.displayName">{{ displayName }}</span>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useUsersStore } from '/@/store/entities/users'
import { UserId } from '/@/types/entity-ids'

const props = defineProps<{
  userId: UserId
}>()

const { usersMap, fetchUser } = useUsersStore()

const user = computed(() => usersMap.value.get(props.userId))
const displayName = computed(() => user.value?.displayName ?? 'unknown')
if (user.value === undefined) {
  fetchUser({ userId: props.userId })
}
</script>

<style lang="scss" module>
.header {
  display: inline-flex;
  align-items: center;
  min-width: 0;
}

.displayName {
  @include size-body2;
  font-weight: bold;
  word-break: keep-all;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>
