<template>
  <span
    :class="$style.container"
    :data-background="background"
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
import type { UserId } from '/@/types/entity-ids'

type Background = 'secondary' | 'tertiary'
const props = withDefaults(
  defineProps<{
    group: UserGroup
    includeInactive?: boolean
    background?: Background
  }>(),
  {
    includeInactive: false,
    background: 'secondary'
  }
)

const { activeUsersMap } = useUsersStore()

const isCounted = (id: UserId) =>
  props.includeInactive || activeUsersMap.value.has(id)

const adminCount = computed(
  () => props.group.admins.filter(id => isCounted(id)).length
)
const memberCount = computed(
  () => props.group.members.filter(m => isCounted(m.id)).length
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
  &[data-background='tertiary'] {
    @include background-tertiary;
  }
}
.separator {
  margin: 0 1px 0 4px;
}
</style>
