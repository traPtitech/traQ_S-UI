<template>
  <div
    @click.stop="openModal"
    :role="isClickable ? 'button' : 'listitem'"
    :class="$style.container"
  >
    <user-icon :class="$style.icon" :user-id="userId" :size="36" />
    <span>{{ name }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
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
    const user = computed(() => store.state.entities.users[props.userId])
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
  display: flex;
  align-items: center;
  &[role='button'] {
    cursor: pointer;
  }
}
.icon {
  margin-right: 16px;
}
</style>
