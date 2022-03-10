<template>
  <div :class="$style.container">
    <div :class="$style.header">
      <label :class="$style.checkAll">
        <form-checkbox-inner
          :model-value="isAllChecked"
          @update:model-value="toggleAll"
        />
      </label>
      <filter-input v-model="textFilterState.query" :class="$style.search" />
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
import { defineComponent, computed, PropType } from 'vue'
import UserIcon from '/@/components/UI/UserIcon.vue'
import FormCheckboxInner from '/@/components/UI/FormCheckboxInner.vue'
import { UserId } from '/@/types/entity-ids'
import FilterInput from '/@/components/UI/FilterInput.vue'
import useTextFilter from '/@/use/textFilter'
import { useUsersStore } from '/@/store/entities/users'

const useUserFilter = (props: { excludeIds: UserId[] }) => {
  const { activeUsersMap } = useUsersStore()

  const excludeIdsSet = computed(() => new Set(props.excludeIds))
  const users = computed(() =>
    [...activeUsersMap.value.values()].filter(
      u => !excludeIdsSet.value.has(u.id) && !u.name.startsWith('Webhook#')
    )
  )

  const { textFilterState } = useTextFilter(users, 'name')
  const shouldUseMultipleFilter = computed(
    () => textFilterState.query.trim().split(' ').length >= 2
  )
  const multipleFilteredUsers = computed(() => {
    const queries = new Set(
      textFilterState.query
        .trim()
        .split(' ')
        .map(q => q.trim().replace(/^@/, ''))
    )
    return users.value.filter(u => queries.has(u.name))
  })
  const filteredUsers = computed(() =>
    shouldUseMultipleFilter.value
      ? multipleFilteredUsers.value
      : textFilterState.filteredItems
  )

  return { textFilterState, filteredUsers }
}

export default defineComponent({
  name: 'UsersSelector',
  components: {
    UserIcon,
    FormCheckboxInner,
    FilterInput
  },
  props: {
    modelValue: {
      type: Set as PropType<Set<UserId>>,
      required: true
    },
    excludeIds: {
      type: Array as PropType<UserId[]>,
      required: true
    }
  },
  emits: {
    'update:modelValue': (_val: Set<UserId>) => true
  },
  setup(props, { emit }) {
    const { textFilterState, filteredUsers } = useUserFilter(props)

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

    return { textFilterState, filteredUsers, isAllChecked, toggleAll, toggle }
  }
})
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
