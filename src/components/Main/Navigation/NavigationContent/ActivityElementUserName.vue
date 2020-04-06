<template>
  <div :class="$style.container" :style="styles.container">
    <user-icon :class="$style.icon" :userId="user.id" :size="20" />
    <span>
      {{ user.displayName }}
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, PropType } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import { User } from '@traptitech/traq'
import UserIcon from '@/components/UI/UserIcon.vue'

export default defineComponent({
  name: 'ActivityElementUserName',
  components: {
    UserIcon
  },
  props: {
    user: {
      type: Object as PropType<User>,
      required: true
    }
  },
  setup(props, context) {
    const styles = reactive({
      container: makeStyles(theme => ({
        color: theme.ui.secondary
      }))
    })
    return {
      styles
    }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  height: 1.5rem;
}
.icon {
  margin-right: 8px;
}
</style>
