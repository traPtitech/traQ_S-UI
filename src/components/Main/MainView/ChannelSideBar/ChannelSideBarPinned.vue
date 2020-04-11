<template>
  <div :class="$style.container" :style="styles.container" @click="onClick">
    <div :class="$style.pinnedTitle">ピン留め</div>
    <div>{{ propst.pinnedMessageLength }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, reactive } from '@vue/composition-api'
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
  props: { pinnedMessageLength: { type: Number, default: 0 } },
  setup(props, context) {
    const styles = useStyles()
    const onClick = () => context.emit('open')
    // TODO: https://github.com/vuejs/composition-api/issues/291
    const propst = props as { pinnedMessageLength: number }
    return {
      styles,
      propst,
      onClick
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
  transition: 0.5s;
  padding: 0 8px;
  font-size: $pinnedSize;
  border-radius: 4px;
  flex-shrink: 0;
  cursor: pointer;
}

.pinnedTitle {
  font-weight: bold;
}
</style>
