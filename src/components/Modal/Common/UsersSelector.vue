<template>
  <div :class="$style.container">
    <div :class="$style.header">
      <label :class="$style.checkAll">
        <form-checkbox-inner
          :model-value="isAllChecked"
          @update:model-value="toggleAll"
        />
      </label>
      <filter-input v-model="query" :class="$style.search" focus-on-mount />
    </div>
    <div :class="$style.list">
      <label v-for="user in filteredUsers" :key="user.id" :class="$style.user">
        <form-checkbox-inner
          :model-value="modelValue.has(user.id)"
          @update:model-value="toggle(user.id)"
        />
        <user-icon :user-id="user.id" prevent-modal :class="$style.userIcon" />
        <div :class="$style.displayName">{{ user.displayName }}</div>
      </label>
    </div>
  </div>
</template>

<script lang="ts">
import { computed } from 'vue'
import type { UserId } from '/@/types/entity-ids'
import useTextFilter from '/@/composables/utils/useTextFilter'
import useUserList from '/@/composables/users/useUserList'

const useUserFilter = (props: { excludeIds: UserId[] }) => {
  const userList = useUserList(
    computed(() => ['inactive', 'webhook', ...props.excludeIds])
  )

  const { query, filteredItems } = useTextFilter(userList, [
    'name',
    'displayName'
  ])
  const shouldUseMultipleFilter = computed(
    () => query.value.trim().split(' ').length >= 2
  )
  const multipleFilteredUsers = computed(() => {
    const queries = new Set(
      query.value
        .trim()
        .split(' ')
        .map(q => q.trim().replace(/^@/, ''))
    )
    return userList.value.filter(u => queries.has(u.name))
  })
  const filteredUsers = computed(() =>
    shouldUseMultipleFilter.value
      ? multipleFilteredUsers.value
      : filteredItems.value
  )

  return { query, filteredUsers }
}
</script>

<script lang="ts" setup>
import UserIcon from '/@/components/UI/UserIcon.vue'
import FormCheckboxInner from '/@/components/UI/FormCheckboxInner.vue'
import FilterInput from '/@/components/UI/FilterInput.vue'

const props = defineProps<{
  modelValue: Set<UserId>
  excludeIds: UserId[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', _val: Set<UserId>): void
}>()

const { query, filteredUsers } = useUserFilter(props)

const isAllChecked = computed(() =>
  filteredUsers.value.every(user => props.modelValue.has(user.id))
)

const toggleAll = () => {
  const newModelValue = new Set(props.modelValue)
  if (isAllChecked.value) {
    for (const user of filteredUsers.value) {
      newModelValue.delete(user.id)
    }
  } else {
    for (const user of filteredUsers.value) {
      newModelValue.add(user.id)
    }
  }
  emit('update:modelValue', newModelValue)
}

const toggle = (id: string) => {
  const newModelValue = new Set(props.modelValue)
  if (newModelValue.has(id)) {
    newModelValue.delete(id)
  } else {
    newModelValue.add(id)
  }
  emit('update:modelValue', newModelValue)
}
</script>

<style lang="scss" module>
.container {
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  margin-right: 4px;
}
.checkAll {
  padding: 0 8px;
  cursor: pointer;
}
.search {
  flex: 1;
}

.list {
  margin: 8px 0;
  overflow: {
    x: hidden;
    y: auto;
  }
  scrollbar-gutter: stable;
}
.user {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0 8px;

  margin: 8px 0;
  &:first-child {
    margin-top: 0;
  }
  &:last-child {
    margin-bottom: 0;
  }
}
.userIcon {
  flex-shrink: 0;
  margin: 0 8px;
}
.displayName {
  @include color-ui-primary;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
