<template>
  <div :class="$style.container">
    <UnreadDMs />
    <UserList />
    <GroupManagerOpener />
  </div>
</template>

<script lang="ts" setup>
import GroupManagerOpener from './GroupManagerOpener.vue'
import UnreadDMs from './UnreadDMs.vue'
import UserList from './UserList.vue'
</script>

<style lang="scss" module>
.container {
  padding: 0 16px 0 0;
}
</style>
