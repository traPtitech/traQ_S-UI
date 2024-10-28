<template>
  <div :class="$style.header">
    <span :class="$style.displayName">{{
      user?.displayName ?? 'unknown'
    }}</span>
    <grade-badge
      :class="$style.badge"
      :user-id="userId"
      :is-bot="user?.bot ?? false"
    />
    <span :class="$style.name">@{{ user?.name ?? 'unknown' }}</span>
    <span
      :class="$style.date"
      :title="createdAt !== updatedAt ? createdDate : undefined"
    >
      {{ date }}
    </span>
    <a-icon
      v-if="createdAt !== updatedAt"
      :class="$style.editIcon"
      :size="16"
      name="pencil-outline"
      mdi
    />
  </div>
</template>

<script lang="ts" setup>
import GradeBadge from './GradeBadge.vue'
import AIcon from '/@/components/UI/AIcon.vue'
import { computed } from 'vue'
import type { UserId } from '/@/types/entity-ids'
import {
  getDateRepresentation,
  getFullDayWithTimeString
} from '/@/lib/basic/date'
import { useUsersStore } from '/@/store/entities/users'

const props = defineProps<{
  userId: UserId
  createdAt: string
  updatedAt: string
}>()

const { usersMap, fetchUser } = useUsersStore()

const user = computed(() => usersMap.value.get(props.userId))
if (user.value === undefined) {
  fetchUser({ userId: props.userId })
}

const createdDate = computed(() =>
  getFullDayWithTimeString(new Date(props.createdAt))
)
const date = computed(() => getDateRepresentation(props.updatedAt))
</script>

<style lang="scss" module>
.header {
  display: inline-flex;
  align-items: baseline;
  min-width: 0;
}

.displayName {
  font-weight: bold;
  flex: 2;
  max-width: min-content;

  word-break: keep-all;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.badge {
  margin-left: 4px;
}

.name {
  @include color-ui-secondary;
  @include size-body2;
  margin-left: 4px;
  flex: 1;
  max-width: min-content;

  word-break: keep-all;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.date {
  @include color-ui-secondary;
  @include size-caption;
  margin-left: 4px;
}

.editIcon {
  @include color-ui-secondary;
  margin-left: 4px;
  flex-shrink: 0;
}
</style>
