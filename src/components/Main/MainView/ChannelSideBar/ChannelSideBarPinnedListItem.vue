<template>
  <div :class="$style.container" :style="styles.container">
    <div :class="$style.itemHeader">
      <user-icon :size="20" :user-id="pinnedMessage.message.userId" />
      <span :style="styles.displayName" :class="$style.displayName">{{
        state.user.displayName
      }}</span>
    </div>
    <span :class="$style.text" :style="styles.text">{{
      pinnedMessage.message.content
    }}</span>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  computed,
  PropType
} from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import UserIcon from '@/components/UI/UserIcon.vue'
import { Pin } from '@traptitech/traq'
import store from '@/store'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      color: theme.ui.primary,
      background: theme.background.primary
    })),
    displayName: makeStyles(theme => ({
      color: theme.ui.secondary
    })),
    text: makeStyles(theme => ({
      color: theme.ui.primary
    }))
  })

export default defineComponent({
  name: 'ChannelSideBarPinnedListItem',
  components: { UserIcon },
  props: { pinnedMessage: { type: Object as PropType<Pin>, required: true } },
  setup(props) {
    const state = reactive({
      user: computed(
        () => store.state.entities.users[props.pinnedMessage.message.userId]
      )
    })
    const styles = useStyles()
    return { styles, state }
  }
})
</script>

<style lang="scss" module>
$displayNameSize: 1rem;
$textSize: 1rem;

.container {
  width: 256px;
  border-radius: 4px;
  word-break: break-all;
  padding: 16px;
}

.itemHeader {
  display: flex;
  margin-bottom: 8px;
}

.displayName {
  font-size: $displayNameSize;
  margin-left: 8px;
}

.text {
  font-size: $textSize;
}
</style>
