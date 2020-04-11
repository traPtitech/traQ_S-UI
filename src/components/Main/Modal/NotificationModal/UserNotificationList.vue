<template>
  <div :class="$style.container" :style="styles.container">
    <user-notification-list-item user-id="a" />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, reactive } from '@vue/composition-api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import UserNotificationListItem from './UserNotificationListItem.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({}))
  })

export default defineComponent({
  name: 'UserNotificationList',
  components: {
    UserNotificationListItem
  },
  setup() {
    const styles = useStyles()
    return { styles }
  }
})
</script>

<style lang="scss" module>
.container {
}
</style>
