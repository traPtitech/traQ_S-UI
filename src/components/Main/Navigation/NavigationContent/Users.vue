<template>
  <div :class="$style.container">
    <navigation-content-container subtitle="ダイレクトメッセージ">
      <empty-state>Not Implemented</empty-state>
    </navigation-content-container>
    <navigation-content-container subtitle="ユーザーリスト">
      <div
        v-for="userList in userLists"
        :class="$style.list"
        :key="userList[0]"
      >
        <users-separator :name="userList[0]" />
        <users-element
          v-for="user in userList[1]"
          :key="user.id"
          :user="user"
          :class="$style.element"
        />
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
  toRefs
} from '@vue/composition-api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import { User } from '@/lib/api'
import { compareString } from '@/lib/util/string'
import { UserId, UserGroupId } from '@/types/entity-ids'
import EmptyState from '@/components/UI/EmptyState.vue'
import NavigationContentContainer from '@/components/Main/Navigation/NavigationContentContainer.vue'
import UsersElement from './UsersElement.vue'
import UsersSeparator from './UsersSeparator.vue'

const useListByGradeName = () => {
  const userGroups = computed(() => store.getters.entities.gradeTypeUserGroups)
  const users = computed(() => store.state.entities.users)
  const listByGradeName = computed(() => {
    if (userGroups.value.length === 0 || users.value.length === 0) return []
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

export default defineComponent({
  name: 'Users',
  components: {
    EmptyState,
    NavigationContentContainer,
    UsersElement,
    UsersSeparator
  },
  setup() {
    const userLists = useListByGradeName()
    return {
      userLists
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
