<template>
  <div :class="$style.container" :style="containerStyle">
    <user-icon :class="$style.icon" :userId="props.user.id" :size="36" />
    <users-element-user-name :user="props.user" :class="$style.user" />
  </div>
</template>

<script lang="ts">
import { defineComponent, SetupContext } from '@vue/composition-api'
import { User } from '@/lib/api'
import { makeStyles } from '@/lib/styles'
import UserIcon from '@/components/UI/UserIcon.vue'
import UsersElementUserName from './UsersElementUserName.vue'

type Props = { user: User }

export default defineComponent({
  name: 'UsersElement',
  components: {
    UsersElementUserName,
    UserIcon
  },
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  setup(props: Props, context: SetupContext) {
    const containerStyle = makeStyles(theme => ({
      color: theme.ui.tertiary
    }))
    return {
      props,
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
