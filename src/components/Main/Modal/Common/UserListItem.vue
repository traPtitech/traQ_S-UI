<template>
  <div :class="$style.container">
    <user-icon :class="$style.icon" :user-id="userId" :size="36" />
    <span>{{ name }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import store from '@/store'
import UserIcon from '@/components/UI/UserIcon.vue'

export default defineComponent({
  name: 'UserListItem',
  components: { UserIcon },
  props: {
    userId: { type: String, default: '' }
  },
  setup(props) {
    const user = computed(() => store.state.entities.users[props.userId])
    const name = computed(() => user.value?.displayName)
    return { name }
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-primary;
  display: flex;
  align-items: center;
}
.icon {
  margin-right: 16px;
}
</style>
