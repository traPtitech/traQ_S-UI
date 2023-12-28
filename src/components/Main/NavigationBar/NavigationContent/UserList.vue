<template>
  <navigation-content-container subtitle="ユーザーリスト">
    <filter-input v-model="query" on-secondary focus-on-mount />
    <div v-if="query.length > 0" :class="$style.list">
      <users-element
        v-for="user in filteredItems"
        :key="user.id"
        :user="user"
        :class="$style.element"
      />
    </div>
    <template v-else>
      <users-grade-list
        v-for="userListbyGrade in userListsByGrade"
        :key="userListbyGrade.gradeName"
        :name="userListbyGrade.gradeName"
        :users="userListbyGrade.users"
        :class="$style.list"
      />
    </template>
  </navigation-content-container>
</template>

<script lang="ts" setup>
import useTextFilter from '/@/composables/utils/useTextFilter'
import NavigationContentContainer from '/@/components/Main/NavigationBar/NavigationContentContainer.vue'
import UsersElement from './UsersElement.vue'
import UsersGradeList from './UsersGradeList.vue'
import FilterInput from '/@/components/UI/FilterInput.vue'
import useUserListByGrade from './composables/useUserListByGrade'
import useUserList from '/@/composables/users/useUserList'

const userListsByGrade = useUserListByGrade()

const userList = useUserList()
const { query, filteredItems } = useTextFilter(
  userList,
  ['name', 'displayName'],
  { limit: 50 }
)
</script>

<style lang="scss" module>
.element {
  margin: 8px 0;
}
.list {
  margin: 16px 0px;
}
</style>
