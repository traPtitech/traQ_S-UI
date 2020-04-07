<template>
  <div :class="$style.container">
    <navigation-content-container subtitle="ダイレクトメッセージ">
      <empty-state>Not Implemented</empty-state>
    </navigation-content-container>
    <navigation-content-container subtitle="ユーザーリスト">
      <filter-input :onSecondary="true"></filter-input>
      <div
        v-for="userList in userLists"
        :class="$style.list"
        :key="userList[0]"
      >
        <users-separator
          :name="userList[0]"
          :isOpen="userListFoldingState[userList[0]]"
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
    </navigation-content-container>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  SetupContext,
  computed,
  reactive,
  toRefs,
  set,
  Ref,
  ref
} from '@vue/composition-api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import { User } from '@traptitech/traq'
import { compareString } from '@/lib/util/string'
import { UserId, UserGroupId } from '@/types/entity-ids'
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
    for (const group of userGroups.value) {
      userGradeEntries[group?.name ?? ''] = (
        group?.members?.map(member => users.value[member.id]) ?? []
      )
        .filter(user => !!user)
        .sort((u1, u2) => compareString(u1.name, u2.name))
    }

    // 学年なので逆順
    return Object.entries(userGradeEntries).sort((e1, e2) =>
      compareString(e1[0], e2[0], true)
    )
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

type UserFilterState = {
  textFilterState: { query: string; filteredItems: readonly User[] }
  setQuery: (query: string) => void
}
const useUserListFilter = (userLists: Record<string, User[]>) => {
  const state = reactive({
    query: '',
    userListFilterdStates: {} as Record<string, UserFilterState>,
    userLists: userLists
  })
  const filteredItems = (userList: [string, User[]]) => {
    const userGroupName = userList[0]
    if (!state.userListFilterdStates[userGroupName]) {
      var users = ref(userList[1])
      const { textFilterState, setQuery } = useTextFilter(users, 'name')
      const userFilterState = {} as UserFilterState
      userFilterState.textFilterState = textFilterState
      userFilterState.setQuery = setQuery
      set(state.userListFilterdStates, userGroupName, userFilterState)
    }

    state.userListFilterdStates[userGroupName].setQuery(state.query)
    return state.userListFilterdStates[userGroupName].textFilterState
      .filteredItems
  }
  const setQuery = (query: string) => {
    state.query = query
  }
  return {
    filteredItems,
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
    return {
      userLists,
      userListFoldingState,
      onUserListFoldingToggle
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
  &:first-of-type {
    margin-top: 16px;
  }
}
</style>
