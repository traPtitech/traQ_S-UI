<template>
  <modal-frame
    title="グループ"
    :subtitle="name"
    icon-name="group"
    return-button
  >
    <user-list-item
      v-for="user in users"
      :key="user.id"
      :user-id="user.id"
      :is-admin="user.isAdmin"
      :class="$style.item"
    >
      <div :class="$style.role">
        {{ user.role }}
      </div>
      <div v-if="user.isAdmin && !user.isMember" :class="$style.nonMemberAdmin">
        グループ外管理者
      </div>
    </user-list-item>
  </modal-frame>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { UserGroupMember } from '@traptitech/traq'
import { useGroupsStore } from '/@/store/entities/groups'
import { useUsersStore } from '/@/store/entities/users'
import ModalFrame from '../Common/ModalFrame.vue'
import UserListItem from '../Common/UserListItem.vue'

const props = defineProps<{
  id: string
}>()

const { activeUsersMap } = useUsersStore()
const { userGroupsMap } = useGroupsStore()

const group = computed(() => userGroupsMap.value.get(props.id))

type UserGroupMemberOrAdmin = UserGroupMember & {
  isMember: boolean
  isAdmin: boolean
}

const name = computed(() => group.value?.name)
const users = computed((): UserGroupMemberOrAdmin[] => {
  if (!group.value) return []

  const adminIds = new Set(group.value.admins)
  const members = new Map(group.value.members.map(m => [m.id, m]))
  return [
    ...group.value.admins.map(id => {
      const m = members.get(id)
      return { id, role: m?.role ?? '', isMember: !!m, isAdmin: true }
    }),
    ...group.value.members
      .filter(m => !adminIds.has(m.id))
      .map(m => ({ ...m, isMember: true, isAdmin: false }))
  ].filter(m => activeUsersMap.value.has(m.id))
})
</script>

<style lang="scss" module>
.item {
  margin: 8px 0;
  &:first-child {
    margin-top: 0;
  }
  &:last-child {
    margin-bottom: 0;
  }
}
.role {
  @include color-ui-secondary;
  @include size-body2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.nonMemberAdmin {
  @include color-ui-secondary;
  @include size-caption;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
