<template>
  <div :class="$style.container" :style="styles.container">
    <user-icon :class="$style.icon" :user-id="userId" :size="36" />
    <span>{{ name }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, reactive } from '@vue/composition-api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import UserIcon from '@/components/UI/UserIcon.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      color: theme.ui.primary
    }))
  })

export default defineComponent({
  name: 'UserListItem',
  components: { UserIcon },
  props: {
    userId: { type: String, default: '' }
  },
  setup(props) {
    const styles = useStyles()
    const user = computed(() => store.state.entities.users[props.userId])
    const name = computed(() => user.value?.displayName)
    return { styles, name }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  align-items: center;
}
.icon {
  margin-right: 16px;
}
</style>
