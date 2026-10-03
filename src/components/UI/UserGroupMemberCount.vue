<template>
  <span
    :class="$style.container"
    :title="`管理者 ${adminCount} / メンバー ${memberCount}`"
  >
    <AIcon name="crown" mdi :size="16" />
    <span>{{ adminCount }}</span>
    <span :class="$style.separator">/</span>
    <AIcon name="user" :size="16" />
    <span>{{ memberCount }}</span>
  </span>
</template>

<script lang="ts" setup>
import type { UserGroup } from '@traptitech/traq'

import { computed } from 'vue'

import AIcon from '/@/components/UI/AIcon.vue'
import { useUsersStore } from '/@/store/entities/users'

const props = defineProps<{
  group: UserGroup
}>()

const { activeUsersMap } = useUsersStore()

const adminCount = computed(
  () => props.group.admins.filter(id => activeUsersMap.value.has(id)).length
)
const memberCount = computed(
  () => props.group.members.filter(m => activeUsersMap.value.has(m.id)).length
)
</script>

<style lang="scss" module>
.container {
  @include background-secondary;
  @include color-ui-secondary;
  @include size-body2;
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  gap: 2px;
  padding: 0 5px 0 4px;
  border-radius: 4px;
  white-space: nowrap;
}
.separator {
  margin: 0 1px 0 4px;
}
</style>
