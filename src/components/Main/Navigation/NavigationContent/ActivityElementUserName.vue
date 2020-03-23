<template>
  <div :class="$style.container" :style="styles.container">
    <user-icon :class="$style.icon" :userId="props.user.id" :size="20" />
    <span>
      {{ props.user.displayName }}
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent, SetupContext, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import { User } from '@traptitech/traq'
import UserIcon from '@/components/UI/UserIcon.vue'

type Props = { user: User }

export default defineComponent({
  name: 'ActivityElementUserName',
  components: {
    UserIcon
  },
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  setup(props: Props, context: SetupContext) {
    const styles = reactive({
      container: makeStyles(theme => ({
        color: theme.ui.secondary
      }))
    })
    return {
      props,
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
