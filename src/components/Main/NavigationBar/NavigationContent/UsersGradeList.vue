<template>
  <div>
    <users-separator
      :name="name"
      :is-open="!isFolding"
      :has-notification="hasNotification"
      :class="$style.separator"
      @click="toggleFolding"
    />
    <slide-down :class="$style.users" :is-open="!isFolding">
      <users-element v-for="user in users" :key="user.id" :user="user" />
    </slide-down>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, PropType, computed } from 'vue'
import { User } from '@traptitech/traq'
import UsersSeparator from './UsersSeparator.vue'
import UsersElement from './UsersElement.vue'
import SlideDown from '/@/components/UI/SlideDown.vue'
import store from '/@/vuex'
import { isDefined } from '/@/lib/basic/array'
import { useMeStore } from '/@/store/domain/me'

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
    const { unreadChannelsMap } = useMeStore()
    const { isFolding, toggleFolding } = useFolding()

    const dmChannelIds = computed(() =>
      props.users
        .map(user => store.getters.entities.DMChannelIdByUserId(user.id))
        .filter(isDefined)
    )
    const hasNotification = computed(() =>
      dmChannelIds.value.some(id => unreadChannelsMap.value.has(id))
    )

    return { isFolding, toggleFolding, hasNotification }
  }
})
</script>

<style lang="scss" module>
.separator {
  cursor: pointer;
}
.users {
  contain: content;
}
</style>
