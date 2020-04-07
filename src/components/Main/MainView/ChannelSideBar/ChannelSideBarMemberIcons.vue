<template>
  <div :class="$style.container" :style="styles.container">
    <user-icon
      :class="$style.userIcon"
      v-for="id in props.userIds"
      :key="id"
      :userId="id"
      :size="28"
    />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  reactive,
  SetupContext
} from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import UserIcon from '@/components/UI/UserIcon.vue'
import { UserId } from '../../../../types/entity-ids'

type Props = {
  userIds: UserId[]
}

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.primary,
      color: theme.ui.secondary
    }))
  })

export default defineComponent({
  name: 'ChannelSideBarMember',
  components: { UserIcon },
  props: {
    userIds: { type: Array, default: [] }
  },
  setup(props: Props) {
    const styles = useStyles()
    return { styles, props }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  flex-direction: column;
}

.userIcon {
  margin-bottom: 8px;
}
</style>
