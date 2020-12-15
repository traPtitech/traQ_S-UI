<template>
  <div :class="$style.container" @click="openModal">
    {{ user?.displayName ?? 'unknown' }}
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import store from '@/_store'
import { UserId } from '@/types/entity-ids'
import { useUserModalOpener } from '@/use/modalOpener'

export default defineComponent({
  name: 'FileModalContentFooterUsername',
  props: {
    userId: {
      type: String as PropType<UserId>
    }
  },
  setup(props) {
    const user = computed(() => store.state.entities.users[props.userId ?? ''])

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
