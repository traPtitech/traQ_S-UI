<template>
  <div :class="$style.container" :style="styles.container">
    <user-icon :user-id="userId" />
    <span :class="$style.name">{{ name }}</span>
    <toggle @input="onClick" :enabled="subscribed" />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  reactive,
  computed
} from '@vue/composition-api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import { UserId } from '@/types/entity-ids'
import Toggle from '@/components/UI/Toggle.vue'
import UserIcon from '@/components/UI/UserIcon.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      color: theme.ui.primary
    }))
  })

export default defineComponent({
  name: 'UserNotificationListItem',
  components: {
    Toggle,
    UserIcon
  },
  props: {
    userId: {
      type: String as PropType<UserId>,
      required: true
    },
    subscribed: {
      type: Boolean,
      required: true
    }
  },
  setup(props, context) {
    const styles = useStyles()
    const onClick = () => {
      context.emit('change-notification', props.userId, !props.subscribed)
    }
    const name = computed(
      () => store.state.entities.users[props.userId]?.name ?? ''
    )
    return { styles, onClick, name }
  }
})
</script>

<style lang="scss" module>
.container {
  display: grid;
  grid-template-columns: 36px 1fr 44px;
  column-gap: 8px;
  align-items: center;
  width: 100%;
  height: 36px;
}
.name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
