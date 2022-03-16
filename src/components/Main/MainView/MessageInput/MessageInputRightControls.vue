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
        <a-icon v-if="!isPosting" mdi name="send" />
      </transition>
    </button>
  </div>
</template>

<script lang="ts">
import { useResponsiveStore } from '/@/store/ui/responsive'

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
</script>

<script lang="ts" setup>
import MessageInputInsertStampButton from './MessageInputInsertStampButton.vue';
import AIcon from '/@/components/UI/AIcon.vue';

const props = withDefaults(defineProps<{
    canPostMessage?: boolean,
    isPosting?: boolean
}>(), {
    canPostMessage: false,
    isPosting: false
});

const emit = defineEmits<{
    (e: "clickSend"): void,
    (e: "clickStamp"): void
}>();

const { isMobile } = useResponsiveStore()
const { onClickSendButton, onClickStampButton } = useClickHandlers(
  props,
  emit
)
</script>

<style lang="scss" module>
.container {
  @include color-ui-secondary;
  display: flex;
}
.sendButton {
  @include color-accent-primary;
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
  &[disabled] {
    @include color-ui-secondary-inactive;
    cursor: not-allowed;
  }
}
</style>
