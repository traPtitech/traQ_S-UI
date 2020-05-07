<template>
  <div :class="$style.list">
    <users-separator
      :name="name"
      :is-open="!isFolding"
      :has-notification="hasNotification"
      @click.native="toggleFolding"
    />
    <template v-if="isFolding">
      <users-element
        v-for="user in users"
        :key="user.id"
        :user="user"
        :class="$style.element"
      />
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, PropType, computed } from '@vue/composition-api'
import { User } from '@traptitech/traq'
import UsersSeparator from './UsersSeparator.vue'
import UsersElement from './UsersElement.vue'
import store from '@/store'

const useFolding = () => {
  const isFolding = ref(false)
  const toggleFolding = () => {
    isFolding.value = !isFolding.value
  }

  return { isFolding, toggleFolding }
}

export default defineComponent({
  name: 'UsersGradeList',
  components: {
    UsersSeparator,
    UsersElement
  },
  props: {
    name: {
      type: String,
      required: true
    },
    users: {
      type: Array as PropType<User[]>,
      required: true
    }
  },
  setup(props) {
    const { isFolding, toggleFolding } = useFolding()

    const dmChannelIds = computed(() =>
      props.users
        .map(user => store.getters.entities.DMChannelIdByUserId(user.id))
        .filter((id): id is string => !!id)
    )
    const hasNotification = computed(() =>
      dmChannelIds.value.some(
        id => !!store.state.domain.me.unreadChannelsSet[id]
      )
    )

    return { isFolding, toggleFolding, hasNotification }
  }
})
</script>

<style lang="scss" module>
.list {
  cursor: pointer;
}
</style>
