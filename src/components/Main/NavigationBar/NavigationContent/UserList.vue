<template>
  <navigation-content-container subtitle="ユーザーリスト">
    <filter-input v-model="textFilterState.query" on-secondary />
    <div v-if="textFilterState.query.length > 0" :class="$style.list">
      <users-element
        v-for="user in textFilterState.filteredItems"
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

<script lang="ts" setup>
import { computed } from 'vue'
import useTextFilter from '/@/composables/useTextFilter'
import { useUsersStore } from '/@/store/entities/users'
import NavigationContentContainer from '/@/components/Main/NavigationBar/NavigationContentContainer.vue'
import UsersElement from './UsersElement.vue'
import UsersGradeList from './UsersGradeList.vue'
import FilterInput from '/@/components/UI/FilterInput.vue'
import useUserListByGrade from './composables/useUserListByGrade'

const userLists = useUserListByGrade()

const { activeUsersMap } = useUsersStore()
const activeUsers = computed(() => [...activeUsersMap.value.values()])
const { textFilterState } = useTextFilter(activeUsers, 'name')
</script>

<style lang="scss" module>
.element {
  margin: 8px 0;
}
.list {
  margin: 16px 0px;
}
</style>
