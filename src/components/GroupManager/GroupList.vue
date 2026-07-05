<template>
  <div>
    <div
      v-for="group in groups"
      :key="group.id"
      :ref="el => setSelectedGroupElement(el, group.id)"
      :class="$style.item"
    >
      <GroupListGroup
        :group="group"
        :is-selected="selectedGroupId === group.id"
        @select="selectedGroupId = $event"
      />
    </div>
    <div v-if="groups.length <= 0" :class="$style.notFound">
      自分が管理者になっているユーザーグループはありません
    </div>
  </div>
</template>

<script lang="ts" setup>
import { UserPermission } from '@traptitech/traq'

import { computed, nextTick, ref, watch } from 'vue'
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

const selectedGroupId = computed<UserGroupId | undefined>({
  get: () => {
    const id = route.hash.slice(1) as UserGroupId

    return groups.value.some(group => group.id === id) ? id : undefined
  },
  set: id => {
    void router.replace({
      hash: id ? `#${id}` : ''
    })
  }
})

const setSelectedGroupElement = (el: unknown | null, id: UserGroupId) => {
  if (!(el instanceof HTMLElement)) {
    return
  }
  if (selectedGroupId.value !== id) {
    return
  }
  selectedGroupElement.value = el
}

watch(
  selectedGroupId,
  async id => {
    if (!id) {
      selectedGroupElement.value = null
      return
    }

    await nextTick()
    selectedGroupElement.value?.scrollIntoView({
      block: 'nearest'
    })
  },
  {
    immediate: true,
    flush: 'post'
  }
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
