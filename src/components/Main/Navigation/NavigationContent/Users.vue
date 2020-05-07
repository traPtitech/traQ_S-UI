<template>
  <div :class="$style.container">
    <!-- TODO: DMタイムライン
    <navigation-content-container subtitle="ダイレクトメッセージ">
      <empty-state>Not Implemented</empty-state>
    </navigation-content-container>
    -->
    <navigation-content-container subtitle="ユーザーリスト">
      <filter-input
        :text="userListFilterState.query"
        @input="setQuery"
        on-secondary
      />
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
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import store from '@/store'
import { User } from '@traptitech/traq'
import { compareStringInsensitive } from '@/lib/util/string'
import EmptyState from '@/components/UI/EmptyState.vue'
import NavigationContentContainer from '@/components/Main/Navigation/NavigationContentContainer.vue'
import UsersElement from './UsersElement.vue'
import UsersGradeList from './UsersGradeList.vue'
import FilterInput from '@/components/UI/FilterInput.vue'
import useTextFilter from '@/use/textFilter'
import { UserMap } from '@/store/entities'

interface UsersGradeList {
  gradeName: string
  users: User[]
}

const useListByGradeName = () => {
  const userGroups = computed(() => store.getters.entities.gradeTypeUserGroups)
  const users = computed(() => store.state.entities.users)
  const listByGradeName = computed((): UsersGradeList[] => {
    if (
      userGroups.value.length === 0 ||
      Object.keys(users.value).length === 0
    ) {
      return []
    }
    const userGrades: UsersGradeList[] = []
    const categorized = new Set<string>()

    // 学年グループ
    for (const group of userGroups.value) {
      const member = (group.members
        .map(member => users.value[member.id])
        .filter(user => !!user) as User[]).sort((u1, u2) =>
        compareStringInsensitive(u1.name, u2.name)
      )
      if (member.length === 0) continue // グループ内にメンバーが居ない場合は非表示

      userGrades.push({ gradeName: group.name, users: member })

      member.map(user => user.id).forEach(id => categorized.add(id))
    }

    // BOTグループ
    const bots = Object.values(users.value as UserMap)
      .filter(user => user.bot)
      .sort((u1, u2) => compareStringInsensitive(u1.name, u2.name))
    bots.map(user => user.id).forEach(id => categorized.add(id))

    // その他グループ
    const others = Object.values(users.value as UserMap)
      .filter(user => user && !categorized.has(user.id))
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
  const users = computed(
    () => Object.values(store.state.entities.users) as User[]
  )
  const { textFilterState, setQuery } = useTextFilter(users, 'name')
  return {
    userListFilterState: textFilterState,
    setQuery
  }
}

export default defineComponent({
  name: 'Users',
  components: {
    EmptyState,
    NavigationContentContainer,
    UsersElement,
    UsersGradeList,
    FilterInput
  },
  setup() {
    const userLists = useListByGradeName()
    const { userListFilterState, setQuery } = useUserListFilter()
    return {
      userLists,
      userListFilterState,
      setQuery
    }
  }
})
</script>

<style lang="scss" module>
.container {
  padding: 0 16px 0 0;
}
.element {
  margin: 8px 0;
}
.list {
  margin: 16px 0px;
}
</style>
