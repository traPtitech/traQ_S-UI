<template>
  <div :class="$style.container" :style="styles.container" @click="onClick">
    <div :class="$style.pinnedTitle">ピン留め</div>
    <div>{{ props.pinnedMessageLength }}</div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  reactive,
  SetupContext
} from '@vue/composition-api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'

type Props = {
  pinnedMessageLength: number
}

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
  setup(props: Props, context: SetupContext) {
    const styles = useStyles()
    const onClick = () => context.emit('open')
    return {
      styles,
      props,
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
  margin-top: 16px;
  transition: 0.5s;
  padding-right: 8px;
  padding-left: 8px;
  font-size: $pinnedSize;
  border-radius: 4px;
  flex-shrink: 0;
  cursor: pointer;
}

.pinnedTitle {
  font-weight: bold;
}
</style>
