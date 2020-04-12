<template>
  <div :class="$style.container" :style="containerStyle">
    <user-icon :class="$style.icon" :user-id="user.id" :size="36" />
    <users-element-user-name :user="user" :class="$style.user" />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@vue/composition-api'
import { User } from '@traptitech/traq'
import { makeStyles } from '@/lib/styles'
import UserIcon from '@/components/UI/UserIcon.vue'
import UsersElementUserName from './UsersElementUserName.vue'

export default defineComponent({
  name: 'UsersElement',
  components: {
    UsersElementUserName,
    UserIcon
  },
  props: {
    user: {
      type: Object as PropType<User>,
      required: true
    }
  },
  setup(props, context) {
    const containerStyle = makeStyles(theme => ({
      color: theme.ui.tertiary
    }))
    return {
      containerStyle
    }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  padding: 2px;
  cursor: pointer;
}
.icon {
  margin-right: 16px;
}
</style>
