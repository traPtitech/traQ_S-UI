<template>
  <div :class="$style.header">
    <span :class="$style.displayName">{{ state.displayName }}</span>
    <grade-badge :class="$style.badge" :user-id="userId" :is-bot="state.bot" />
    <span :class="$style.name">@{{ state.name }}</span>
    <span
      :class="$style.date"
      :title="createdAt !== updatedAt ? state.createdDate : undefined"
    >
      {{ state.date }}
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
import { reactive, computed } from 'vue'
import { UserId } from '/@/types/entity-ids'
import { getDisplayDate, getFullDayWithTimeString } from '/@/lib/basic/date'
import { useUsersStore } from '/@/store/entities/users'

const props = defineProps<{
  userId: UserId
  createdAt: string
  updatedAt: string
}>()

const { usersMap, fetchUser } = useUsersStore()

const state = reactive({
  user: computed(() => usersMap.value.get(props.userId)),
  displayName: computed((): string => state.user?.displayName ?? 'unknown'),
  name: computed((): string => state.user?.name ?? 'unknown'),
  bot: computed((): boolean => state.user?.bot ?? false),
  createdDate: computed(() =>
    getFullDayWithTimeString(new Date(props.createdAt))
  ),
  date: computed(() => getDisplayDate(props.createdAt, props.updatedAt))
})
if (state.user === undefined) {
  fetchUser({ userId: props.userId })
}
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
