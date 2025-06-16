<template>
  <div>
    <group-list-group
      v-for="group in groups"
      :key="group.id"
      :group="group"
      :class="$style.item"
      :is-selected="selectedId === group.id"
      @select="onSelect"
    />
    <div v-if="groups.length <= 0" :class="$style.notFound">
      自分が管理者になっているユーザーグループはありません
    </div>
  </div>
</template>

<script lang="ts" setup>
import GroupListGroup from './GroupListGroup.vue'
import { computed, ref } from 'vue'
import type { UserGroupId } from '/@/types/entity-ids'
import { UserPermission } from '@traptitech/traq'
import { useMeStore } from '/@/store/domain/me'
import { useUsersStore } from '/@/store/entities/users'
import { useGroupsStore } from '/@/store/entities/groups'
import { compareString } from '/@/lib/basic/string'

const { detail, myId } = useMeStore()
const { fetchUsers } = useUsersStore()
const { userGroupsMap, fetchUserGroups } = useGroupsStore()

fetchUsers()
fetchUserGroups()

const selectedId = ref<UserGroupId>()
const onSelect = (id: UserGroupId) => {
  selectedId.value = id
}
const isAllUserGroupsAdmin = computed(() =>
  detail.value?.permissions.includes(UserPermission.AllUserGroupsAdmin)
)

const groups = computed(() =>
  [...userGroupsMap.value.values()]
    .filter(group => {
      const myIdVal = myId.value
      return (
        isAllUserGroupsAdmin.value ||
        (myIdVal && group.admins.includes(myIdVal))
      )
    })
    .sort((a, b) => compareString(a.name, b.name))
)
</script>

<style lang="scss" module>
.item {
  margin: 16px 0;
  &:first-child {
    margin-top: 0;
  }
  &:last-child {
    margin-bottom: 0;
  }
}
.notFound {
  @include color-ui-secondary;
}
</style>
