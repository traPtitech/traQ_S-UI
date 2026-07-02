<template>
  <div>
    <div
      v-for="group in groups"
      :key="group.id"
      :ref="el => setSelectedGroupElement(el, group.id)"
    >
      <GroupListGroup
        :group="group"
        :class="$style.item"
        :is-selected="isSelectedGroup(group.id)"
        @select="onSelect"
      />
    </div>
    <div v-if="groups.length <= 0" :class="$style.notFound">
      自分が管理者になっているユーザーグループはありません
    </div>
  </div>
</template>

<script lang="ts" setup>
import { UserPermission } from '@traptitech/traq'

import { type ComponentPublicInstance, computed, nextTick, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { compareString } from '/@/lib/basic/string'
import { useMeStore } from '/@/store/domain/me'
import { useGroupsStore } from '/@/store/entities/groups'
import { useUsersStore } from '/@/store/entities/users'
import type { UserGroupId } from '/@/types/entity-ids'

import GroupListGroup from './GroupListGroup.vue'

const route = useRoute()
const router = useRouter()
const { detail, myId } = useMeStore()
const { fetchUsers } = useUsersStore()
const { userGroupsMap, fetchUserGroups } = useGroupsStore()

fetchUsers()
fetchUserGroups()

const onSelect = (id: UserGroupId) => {
  router.replace({ hash: `#${id}` })
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

const selectedGroupElement = ref<HTMLElement | null>(null)
const lastScrolledHash = ref<string | null>(null)

const isSelectedGroup = (id: UserGroupId) => {
  return route.hash === `#${id}`
}

const setSelectedGroupElement = (
  el: Element | ComponentPublicInstance | null,
  id: UserGroupId
) => {
  if (isSelectedGroup(id) && el) {
    selectedGroupElement.value = el as HTMLElement
    const hash = route.hash
    if (lastScrolledHash.value !== hash) {
      lastScrolledHash.value = hash
      nextTick(() => {
        ;(el as HTMLElement).scrollIntoView({ block: 'nearest' })
      })
    }
  }
}
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
