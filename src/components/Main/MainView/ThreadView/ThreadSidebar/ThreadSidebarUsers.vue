<template>
  <SidebarContentContainer :title="title">
    <div v-if="userIds.length" :class="$style.list">
      <div v-for="id in userIds" :key="id" :class="$style.user">
        <UserIcon :user-id="id" :size="24" />
        <bdi :class="$style.name">{{
          usersMap.get(id)?.displayName ?? 'unknown'
        }}</bdi>
      </div>
    </div>
    <EmptyState v-else>メンバーはいません</EmptyState>
  </SidebarContentContainer>
</template>

<script lang="ts" setup>
import SidebarContentContainer from '/@/components/Main/MainView/PrimaryViewSidebar/SidebarContentContainer.vue'
import EmptyState from '/@/components/UI/EmptyState.vue'
import UserIcon from '/@/components/UI/UserIcon.vue'
import { useUsersStore } from '/@/store/entities/users'
import type { UserId } from '/@/types/entity-ids'

defineProps<{ title: string; userIds: readonly UserId[] }>()
const { usersMap } = useUsersStore()
</script>

<style lang="scss" module>
.list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.user {
  @include color-ui-primary;
  display: flex;
  align-items: center;
  gap: 16px;
}
.name {
  min-width: 0;
  overflow-wrap: anywhere;
}
</style>
