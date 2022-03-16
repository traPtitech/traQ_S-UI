<template>
  <navigation-content-container subtitle="ユーザーリスト">
    <filter-input v-model="userListFilterState.query" on-secondary />
    <div v-if="userListFilterState.query.length > 0" :class="$style.list">
      <users-element
        v-for="user in userListFilterState.filteredItems"
        :key="user.id"
        :user="user"
        :class="$style.element"
      />
    </div>
    <template v-else>
      <users-grade-list
        v-for="userList in userLists"
        :key="userList.gradeName"
        :name="userList.gradeName"
        :users="userList.users"
        :class="$style.list"
      />
    </template>
  </navigation-content-container>
</template>

<script lang="ts">
import { computed } from 'vue';
import { compareStringInsensitive } from '/@/lib/basic/string'
import useTextFilter from '/@/composables/useTextFilter'
import { isDefined } from '/@/lib/basic/array'
import { ActiveUser } from '/@/lib/user'
import { useGroupsStore } from '/@/store/entities/groups'
import { useUsersStore } from '/@/store/entities/users'

interface UsersGradeList {
  gradeName: string
  users: ActiveUser[]
}

const useListByGradeName = () => {
  const { gradeGroups } = useGroupsStore()
  const { activeUsersMap } = useUsersStore()

  const listByGradeName = computed((): UsersGradeList[] => {
    if (activeUsersMap.value.size === 0) {
      return []
    }
    if (gradeGroups.value.length === 0) {
      return [
        {
          gradeName: 'Others',
          users: [...activeUsersMap.value.values()].sort((u1, u2) =>
            compareStringInsensitive(u1.name, u2.name)
          )
        }
      ]
    }

    const userGrades: UsersGradeList[] = []
    const categorized = new Set<string>()

    // 学年グループ
    for (const group of gradeGroups.value) {
      const member = group.members
        .map(member => activeUsersMap.value.get(member.id))
        .filter(isDefined)
        .sort((u1, u2) => compareStringInsensitive(u1.name, u2.name))
      if (member.length === 0) continue // グループ内にメンバーが居ない場合は非表示

      userGrades.push({ gradeName: group.name, users: member })

      member.map(user => user.id).forEach(id => categorized.add(id))
    }

    // BOTグループ
    const bots = [...activeUsersMap.value.values()]
      .filter(user => user.bot)
      .sort((u1, u2) => compareStringInsensitive(u1.name, u2.name))
    bots.map(user => user.id).forEach(id => categorized.add(id))

    // その他グループ
    const others = [...activeUsersMap.value.values()]
      .filter(user => !categorized.has(user.id))
      .sort((u1, u2) => compareStringInsensitive(u1.name, u2.name))

    const result = [
      ...userGrades.sort(
        (e1, e2) => compareStringInsensitive(e1.gradeName, e2.gradeName, true) // 学年なので逆順
      )
    ]
    if (others.length > 0) result.push({ gradeName: 'Others', users: others })
    if (bots.length > 0) result.push({ gradeName: 'BOT', users: bots })

    return result
  })
  return listByGradeName
}

const useUserListFilter = () => {
  const { activeUsersMap } = useUsersStore()
  const activeUsers = computed(() => [...activeUsersMap.value.values()])
  const { textFilterState } = useTextFilter(activeUsers, 'name')
  return {
    userListFilterState: textFilterState
  }
}
</script>

<script lang="ts" setup>
import NavigationContentContainer from '/@/components/Main/NavigationBar/NavigationContentContainer.vue';
import UsersElement from './UsersElement.vue';
import UsersGradeList from './UsersGradeList.vue';
import FilterInput from '/@/components/UI/FilterInput.vue';

const userLists = useListByGradeName()
const { userListFilterState } = useUserListFilter()
</script>

<style lang="scss" module>
.element {
  margin: 8px 0;
}
.list {
  margin: 16px 0px;
}
</style>
