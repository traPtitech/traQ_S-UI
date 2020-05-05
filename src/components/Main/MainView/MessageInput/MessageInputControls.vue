<template>
  <div :class="$style.container">
    <div @click="onClickStampButton" :class="$style.button">
      <icon mdi name="emoticon-outline" />
    </div>
    <button
      @click="onClickSendButton"
      :disabled="!canPostMessage"
      :class="$style.button"
    >
      <icon mdi name="send" />
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, SetupContext } from '@vue/composition-api'
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
    const { onClickSendButton, onClickStampButton } = useClickHandlers(
      props,
      context
    )
    return {
      onClickSendButton,
      onClickStampButton
    }
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-secondary;
  display: flex;
}
.button {
  @include color-accent-primary;
  cursor: pointer;
  &[disabled] {
    @include color-ui-secondary;
    opacity: 0.5;
    cursor: not-arrowed;
  }
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
