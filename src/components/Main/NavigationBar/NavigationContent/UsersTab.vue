<template>
  <div :class="$style.container">
    <unread-d-ms />
    <user-list />
    <group-manager-opener />
  </div>
</template>

<script lang="ts" setup>
import UnreadDMs from './UnreadDMs.vue';
import UserList from './UserList.vue';
import GroupManagerOpener from './GroupManagerOpener.vue';
</script>

<style lang="scss" module>
.container {
  padding: 0 16px 0 0;
}
</style>
