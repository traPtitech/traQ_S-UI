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

<script lang="ts">
import { defineComponent, computed, ref } from 'vue'
import store from '@/store'
import GroupListGroup from './GroupListGroup.vue'
import { UserGroupId } from '@/types/entity-ids'
import { UserPermission } from '@traptitech/traq'

export default defineComponent({
  name: 'GroupList',
  components: {
    GroupListGroup
  },
  setup() {
    store.dispatch.entities.fetchUsers()
    store.dispatch.entities.fetchUserGroups()

    const selectedId = ref<UserGroupId>()
    const onSelect = (id: UserGroupId) => {
      selectedId.value = id
    }
    const isAllUserGroupsAdmin = computed(() =>
      store.state.domain.me.detail?.permissions.includes(
        UserPermission.AllUserGroupsAdmin
      )
    )

    const groups = computed(() =>
      [...store.state.entities.userGroupsMap.values()].filter(group => {
        const myId = store.getters.domain.me.myId
        return (
          isAllUserGroupsAdmin.value || (myId && group.admins.includes(myId))
        )
      })
    )

    return { selectedId, onSelect, groups }
  }
})
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
