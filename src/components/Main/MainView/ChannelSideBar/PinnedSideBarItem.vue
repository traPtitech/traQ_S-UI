<template>
  <div :class="$style.container" :style="styles.container">
    <div :class="$style.itemHeader">
      <user-icon :size="20" :userId="props.pinnedMessage.message.userId" />
      <span :style="styles.displayName" :class="$style.displayName">{{
        state.user.displayName
      }}</span>
    </div>
    <span :class="$style.text" :style="styles.text">{{
      props.pinnedMessage.message.content
    }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, computed } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import UserIcon from '@/components/UI/UserIcon.vue'
import { Pin } from '@traptitech/traq'
import store from '@/store'

type Props = {
  pinnedMessage: Pin
}

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
  name: 'PinnedSideBarItem',
  components: { UserIcon },
  props: { pinnedMessage: { type: Object, required: true } },
  setup(props: Props) {
    const state = reactive({
      user: computed(
        () => store.state.entities.users[props.pinnedMessage.message.userId]
      )
    })
    const styles = useStyles()
    return { styles, props, state }
  }
})
</script>

<style lang="scss" module>
$displayNameSize: 1rem;
$textSize: 1.15rem;

.container {
  width: 256px;
  margin-top: 16px;
  border-radius: 4px;
  word-break: break-all;
  padding: 16px;
  padding-right: 16px;
  padding-left: 16px;
}

.itemHeader {
  display: flex;
  margin-left: 4px;
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
