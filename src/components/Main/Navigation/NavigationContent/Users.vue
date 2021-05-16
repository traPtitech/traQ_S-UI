<template>
  <div :class="$style.container">
    <unread-d-ms />
    <user-list />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import UnreadDMs from './UnreadDMs.vue'
import UserList from './UserList.vue'

export default defineComponent({
  name: 'Users',
  components: {
    UnreadDMs,
    UserList
  }
})
</script>

<style lang="scss" module>
.container {
  padding: 0 16px 0 0;
}
</style>
