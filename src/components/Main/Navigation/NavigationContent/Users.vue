<template>
  <div :class="$style.container">
    <navigation-content-container subtitle="ダイレクトメッセージ">
      <empty-state>Not Implemented</empty-state>
    </navigation-content-container>
    <navigation-content-container subtitle="ユーザーリスト">
      <filter-input
        :on-secondary="true"
        :text="userListFilterState.query"
        @input="setQuery"
      />
      <div v-if="userListFilterState.query.length > 0" :class="$style.list">
        <users-element
          v-for="user in userListFilterState.filteredItems"
          :key="user.id"
          :user="user"
          :class="$style.element"
        />
      </div>
      <div v-else>
        <div
          v-for="userList in userLists"
          :class="$style.list"
          :key="userList[0]"
        >
          <users-separator
            :name="userList[0]"
            :is-open="userListFoldingState[userList[0]]"
            @click.native="onUserListFoldingToggle(userList[0])"
          />
          <div v-show="userListFoldingState[userList[0]]">
            <users-element
              v-for="user in userList[1]"
              :key="user.id"
              :user="user"
              :class="$style.element"
            />
          </div>
        </div>
      </div>
    </navigation-content-container>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  reactive,
  toRefs,
  set
} from '@vue/composition-api'
import store from '@/store'
import { User } from '@traptitech/traq'
import { compareString } from '@/lib/util/string'
import EmptyState from '@/components/UI/EmptyState.vue'
import NavigationContentContainer from '@/components/Main/Navigation/NavigationContentContainer.vue'
import UsersElement from './UsersElement.vue'
import UsersSeparator from './UsersSeparator.vue'
import FilterInput from '@/components/UI/FilterInput.vue'
import useTextFilter from '@/use/textFilter'

const useListByGradeName = () => {
  const userGroups = computed(() => store.getters.entities.gradeTypeUserGroups)
  const users = computed(() => store.state.entities.users)
  const listByGradeName = computed(() => {
    if (
      userGroups.value.length === 0 ||
      Object.keys(users.value).length === 0
    ) {
      return []
    }
    const userGradeEntries: Record<string, User[]> = {}
    const categorized = new Set<string>()

    // 学年グループ
    for (const group of userGroups.value) {
      const member = ((
        group.members.map(member => users.value[member.id]) ?? []
      ).filter(user => !!user) as User[]).sort((u1, u2) =>
        compareString(u1.name, u2.name)
      )
      userGradeEntries[group.name] = member

      member.map(user => user.id).forEach(id => categorized.add(id))
    }

    // BOTグループ
    const bots = (Object.values(users.value).filter(
      user => user?.bot
    ) as User[]).sort((u1, u2) => compareString(u1.name, u2.name))
    bots.map(user => user.id).forEach(id => categorized.add(id))

    return [
      ...Object.entries(userGradeEntries).sort(
        (e1, e2) => compareString(e1[0], e2[0], true) // 学年なので逆順
      ),
      [
        'Others',
        (Object.values(users.value).filter(
          user => user && !categorized.has(user.id)
        ) as User[]).sort((u1, u2) => compareString(u1.name, u2.name))
      ],
      ['BOT', bots]
    ]
  })
  return listByGradeName
}

const useUserListFolding = () => {
  const state = reactive({
    userListFoldingState: {} as Record<string, boolean>
  })
  const onUserListFoldingToggle = (userGroupName: string) => {
    if (state.userListFoldingState[userGroupName]) {
      state.userListFoldingState[userGroupName] = false
    } else {
      set(state.userListFoldingState, userGroupName, true)
    }
  }
  return {
    ...toRefs(state),
    onUserListFoldingToggle
  }
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
    UsersSeparator,
    FilterInput
  },
  setup() {
    const userLists = useListByGradeName()
    const {
      userListFoldingState,
      onUserListFoldingToggle
    } = useUserListFolding()
    const { userListFilterState, setQuery } = useUserListFilter()
    return {
      userLists,
      userListFoldingState,
      onUserListFoldingToggle,
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
  cursor: pointer;
  margin: 16px 0px;
}
</style>
