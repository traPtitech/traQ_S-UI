<template>
  <div :class="$style.container" @click="openModal">
    <a-icon name="user" :size="20" />
    {{ user?.displayName ?? 'unknown' }}
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import { UserId } from '/@/types/entity-ids'
import { useUserModalOpener } from '/@/composables/useModalOpener'
import AIcon from '/@/components/UI/AIcon.vue'
import { useUsersStore } from '/@/store/entities/users'

export default defineComponent({
  name: 'FileModalContentFooterUsername',
  components: { AIcon },
  props: {
    userId: {
      type: String as PropType<UserId>,
      default: undefined
    }
  },
  setup(props) {
    const { usersMap } = useUsersStore()

    const user = computed(() => usersMap.value.get(props.userId ?? ''))

    const { openModal } = useUserModalOpener(props, user)

    return { user, openModal }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  cursor: pointer;
}
</style>
