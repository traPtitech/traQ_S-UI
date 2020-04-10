<template>
  <div :class="$style.container" :style="styles.container">
    <div @click="onClickStampButton" :class="$style.button">
      <icon mdi name="emoticon-outline" />
    </div>
    <div
      @click="onClickSendButton"
      :class="$style.button"
      :style="styles.sendButton"
    >
      <icon mdi name="send" />
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  reactive,
  ref,
  onMounted,
  SetupContext,
  watchEffect
} from '@vue/composition-api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import { ChannelId } from '@/types/entity-ids'
import Icon from '@/components/UI/Icon.vue'

type Props = {
  canPostMessage: boolean
}

const useClickHandlers = (props: Props, context: SetupContext) => {
  const onClickSendButton = () => {
    if (props.canPostMessage) {
      context.emit('click-send')
    }
  }
  const onClickStampButton = () => {
    context.emit('click-stamp')
  }
  return { onClickSendButton, onClickStampButton }
}

const useStyles = (props: Props) =>
  reactive({
    container: makeStyles(theme => ({
      color: theme.ui.secondary
    })),
    sendButton: makeStyles(theme => ({
      color: props.canPostMessage ? theme.accent.primary : theme.ui.secondary,
      opacity: props.canPostMessage ? '1' : '0.5',
      cursor: props.canPostMessage ? 'pointer' : 'not-allowed'
    }))
  })

export default defineComponent({
  name: 'MessageInputControls',
  components: {
    Icon
  },
  props: {
    canPostMessage: {
      type: Boolean,
      default: false
    }
  },
  setup(props, context) {
    const styles = useStyles(props)
    const { onClickSendButton, onClickStampButton } = useClickHandlers(
      props,
      context
    )
    return {
      styles,
      onClickSendButton,
      onClickStampButton
    }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
}
.button {
  height: 24px;
  width: 24px;
  cursor: pointer;

  margin: 0 8px;
  &:first-child {
    margin-left: 0;
  }
  &:last-child {
    margin-right: 0;
  }
}
</style>
