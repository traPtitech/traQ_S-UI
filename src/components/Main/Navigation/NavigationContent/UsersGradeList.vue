<template>
  <div :class="$style.list">
    <users-separator
      :name="name"
      :is-open="!isFolding"
      :has-notification="hasNotification"
      @click="toggleFolding"
    />
    <slide-down :class="$style.users" :is-open="!isFolding">
      <users-element
        v-for="user in users"
        :key="user.id"
        :user="user"
        :class="$style.element"
      />
    </slide-down>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, PropType, computed } from 'vue'
import { User } from '@traptitech/traq'
import UsersSeparator from './UsersSeparator.vue'
import UsersElement from './UsersElement.vue'
import SlideDown from '/@/components/UI/SlideDown.vue'
import store from '/@/store'
import { isDefined } from '/@/lib/util/array'

const useFolding = () => {
  const isFolding = ref(true)
  const toggleFolding = () => {
    isFolding.value = !isFolding.value
  }

  return { isFolding, toggleFolding }
}

export default defineComponent({
  name: 'UsersGradeList',
  components: {
    UsersSeparator,
    UsersElement,
    SlideDown
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
        .filter(isDefined)
    )
    const hasNotification = computed(() =>
      dmChannelIds.value.some(id =>
        store.state.domain.me.unreadChannelsMap.has(id)
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
.users {
  contain: content;
}
</style>
