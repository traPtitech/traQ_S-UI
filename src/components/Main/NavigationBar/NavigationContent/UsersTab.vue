<template>
  <div :class="$style.container">
    <NavigationContentTitle current-navigation="users" />
    <UnreadDMs />
    <UserList />
    <GroupManagerOpener />
  </div>
</template>

<script lang="ts" setup>
import NavigationContentTitle from '/@/components/Main/NavigationBar/NavigationContentTitle.vue'

import GroupManagerOpener from './GroupManagerOpener.vue'
import UnreadDMs from './UnreadDMs.vue'
import UserList from './UserList.vue'
</script>

<style lang="scss" module>
.container {
  height: 100%;
  overflow-y: auto;
  padding: 24px 16px 24px 8px;
}
</style>
