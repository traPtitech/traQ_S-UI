<template>
  <div :class="$style.container" :style="styles.container">
    <div
      v-for="state in props.viewerStates"
      :class="[state.viewing ? '' : $style.notView, $style.member]"
      :key="state.user.id"
    >
      <user-icon :size="28" :userId="state.user.id" />
      <span :class="$style.name">{{ state.user.displayName }}</span>
    </div>
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
import { User } from '@traptitech/traq'

type Props = {
  viewerStates: ViewState[]
}

type ViewState = {
  user: User
  viewing: boolean
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
    viewerStates: { type: Array, default: [] }
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

.member {
  margin-bottom: 8px;
  display: flex;
  font-weight: bold;
  align-items: center;
}

.notView {
  opacity: 50%;
}

.name {
  margin-left: 8px;
}
</style>
