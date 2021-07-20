<template>
  <div :class="$style.container" @click="openModal">
    <icon name="user" :size="20" />
    {{ user?.displayName ?? 'unknown' }}
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import store from '/@/store'
import { UserId } from '/@/types/entity-ids'
import { useUserModalOpener } from '/@/use/modalOpener'
import Icon from '/@/components/UI/Icon.vue'

export default defineComponent({
  name: 'FileModalContentFooterUsername',
  components: { Icon },
  props: {
    userId: {
      type: String as PropType<UserId>
    }
  },
  setup(props) {
    const user = computed(() =>
      store.state.entities.usersMap.get(props.userId ?? '')
    )

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
