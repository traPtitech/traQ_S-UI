<template>
  <div :class="$style.header">
    <span :class="$style.displayName">{{ displayName }}</span>
    <span :class="$style.name">{{ name }}</span>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import { useUsersStore } from '/@/store/entities/users'
import type { UserId } from '/@/types/entity-ids'

const props = defineProps<{
  userId: UserId
}>()

const { usersMap, fetchUser } = useUsersStore()

const user = computed(() => usersMap.value.get(props.userId))
const name = computed(() => '@' + (user.value?.name ?? 'unknown'))
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
  flex: 2;
  max-width: min-content;

  word-break: keep-all;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.name {
  @include size-body2;
  @include color-ui-secondary;
  margin-left: 4px;
  flex: 1;
  max-width: min-content;

  word-break: keep-all;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>
