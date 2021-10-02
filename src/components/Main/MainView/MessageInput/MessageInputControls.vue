<template>
  <div :class="$style.container" :data-is-mobile="$boolAttr(isMobile)">
    <message-input-insert-stamp-button @click="onClickStampButton" />
    <button
      :class="$style.sendButton"
      title="送信する"
      :disabled="!canPostMessage"
      data-testid="message-send-button"
      @click="onClickSendButton"
    >
      <transition name="post">
        <icon v-if="!isPosting" mdi name="send" />
      </transition>
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import useIsMobile from '/@/use/isMobile'
import MessageInputInsertStampButton from './MessageInputInsertStampButton.vue'
import Icon from '/@/components/UI/Icon.vue'

const useClickHandlers = (
  props: { canPostMessage: boolean },
  emit: ((event: 'clickSend') => void) & ((event: 'clickStamp') => void)
) => {
  const onClickSendButton = () => {
    if (props.canPostMessage) {
      emit('clickSend')
    }
  }
  const onClickStampButton = () => {
    emit('clickStamp')
  }
  return { onClickSendButton, onClickStampButton }
}

export default defineComponent({
  name: 'MessageInputControls',
  components: {
    MessageInputInsertStampButton,
    Icon
  },
  props: {
    canPostMessage: {
      type: Boolean,
      default: false
    },
    isPosting: {
      type: Boolean,
      default: false
    }
  },
  emits: {
    clickSend: () => true,
    clickStamp: () => true
  },
  setup(props, { emit }) {
    const { isMobile } = useIsMobile()
    const { onClickSendButton, onClickStampButton } = useClickHandlers(
      props,
      emit
    )
    return {
      isMobile,
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
.button,
.sendButton {
  @include color-ui-secondary;
  height: 24px;
  width: 24px;
  cursor: pointer;

  margin: 0 8px;
  .container[data-is-mobile] & {
    margin: 0 8px;
  }

  &:first-child:first-child {
    margin-left: 0;
  }
  &:last-child:last-child {
    margin-right: 0;
  }

  transform: scale(1);
  transition: transform 0.1s;
  &:hover {
    transform: scale(1.1);
  }
}
.sendButton {
  @include color-accent-primary;
  &[disabled] {
    @include color-ui-secondary;
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>
