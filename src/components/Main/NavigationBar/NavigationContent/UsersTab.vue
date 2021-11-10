<template>
  <div :class="$style.container">
    <unread-d-ms />
    <user-list />
    <group-manager-opener />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import UnreadDMs from './UnreadDMs.vue'
import UserList from './UserList.vue'
import GroupManagerOpener from './GroupManagerOpener.vue'

export default defineComponent({
  name: 'UsersTab',
  components: {
    UnreadDMs,
    UserList,
    GroupManagerOpener
  }
})
</script>

<style lang="scss" module>
.container {
  padding: 0 16px 0 0;
}
</style>
