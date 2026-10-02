<template>
  <span :class="$style.container">
    <AIcon name="crown" mdi :size="21" />
    <span>{{ adminCount }}</span>
    <span :class="$style.separator">/</span>
    <AIcon name="user" :size="21" />
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
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  white-space: nowrap;
  &::before {
    content: '(';
    margin-right: 0.1rem;
  }
  &::after {
    content: ')';
    margin-left: 0.2rem;
  }
}
.separator {
  margin: 0 0.1rem 0 0.3rem;
}
</style>
