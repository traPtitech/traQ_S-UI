<template>
  <div
    :role="isClickable ? 'button' : 'listitem'"
    :class="$style.container"
    @click.stop="openModal"
  >
    <user-icon :class="$style.icon" :user-id="userId" :size="36" />
    <span>{{ name }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import store from '@/store'
import UserIcon from '@/components/UI/UserIcon.vue'
import { useUserModalOpener } from '@/use/modalOpener'

export default defineComponent({
  name: 'UserListItem',
  components: { UserIcon },
  props: {
    userId: { type: String, default: '' }
  },
  setup(props) {
    const user = computed(() => store.state.entities.usersMap.get(props.userId))
    const name = computed(() => user.value?.displayName)

    const { isClickable, openModal } = useUserModalOpener(props, user)

    return {
      name,
      isClickable,
      openModal
    }
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-primary;
  position: relative;
  display: flex;
  align-items: center;
  padding: 4px;
  &[role='button'] {
    cursor: pointer;
  }

  &:hover::before {
    content: '';
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: $theme-ui-primary;
    opacity: 0.1;
  }
}
.icon {
  margin-right: 16px;
}
</style>
