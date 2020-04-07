<template>
  <div :class="$style.container" :style="styles.container">
    <div :class="$style.pinnedTitle">ピン留め</div>
    <div>{{ state.pinnedMessage.length }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, reactive, ref } from '@vue/composition-api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.primary,
      color: theme.ui.secondary
    }))
  })

export default defineComponent({
  name: 'ChannelSideBarPinned',
  setup() {
    const styles = useStyles()
    const state = reactive({
      pinnedMessage: computed(
        () => store.state.domain.messagesView.pinnedMessages
      )
    })
    return {
      styles,
      state
    }
  }
})
</script>

<style lang="scss" module>
$pinnedSize: 1.15rem;

.container {
  display: flex;
  width: 256px;
  height: 48px;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
  margin-top: 16px;
  transition: 0.5s;
  padding-right: 8px;
  padding-left: 8px;
  font-size: $pinnedSize;
  border-radius: 4px;
}

.pinnedTitle {
  font-weight: bold;
}
</style>
