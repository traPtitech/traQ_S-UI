<template>
  <div :class="$style.container" :style="styles.container">
    <div
      v-for="state in viewerStates"
      :class="[state.active ? '' : $style.notView, $style.member]"
      :key="state.user.id"
    >
      <user-icon :size="28" :user-id="state.user.id" />
      <span :class="$style.name">{{ state.user.displayName }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, PropType } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import UserIcon from '@/components/UI/UserIcon.vue'
import { User } from '@traptitech/traq'

type ViewState = {
  user: User
  active: boolean
  qalling?: boolean
}

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.primary,
      color: theme.ui.secondary
    }))
  })

export default defineComponent({
  name: 'ChannelSidebarMember',
  components: { UserIcon },
  props: {
    viewerStates: { type: Array as PropType<ViewState[]>, default: [] }
  },
  setup(props) {
    const styles = useStyles()
    return { styles }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  flex-direction: column;
}

.member {
  margin: 4px 0;
  display: flex;
  font-weight: bold;
  align-items: center;
  &:first-child {
    margin-top: 0;
  }
  &:last-child {
    margin-bottom: 0;
  }
}

.notView {
  opacity: 0.5;
}

.name {
  margin-left: 8px;
}
</style>
