<template>
  <div :class="$style.list">
    <users-separator
      :name="name"
      :is-open="!isFolding"
      @click.native="toggleFolding"
    />
    <div v-show="isFolding">
      <users-element
        v-for="user in users"
        :key="user.id"
        :user="user"
        :class="$style.element"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, PropType } from '@vue/composition-api'
import { User } from '@traptitech/traq'
import UsersSeparator from './UsersSeparator.vue'
import UsersElement from './UsersElement.vue'

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
  setup() {
    const { isFolding, toggleFolding } = useFolding()
    return { isFolding, toggleFolding }
  }
})
</script>

<style lang="scss" module>
.list {
  cursor: pointer;
}
</style>
