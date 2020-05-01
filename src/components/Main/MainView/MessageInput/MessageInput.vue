<template>
  <div
    :class="$style.container"
    :style="styles.container"
    :data-is-mobile="isMobile"
  >
    <portal-target
      :class="$style.stampPickerLocator"
      :name="targetPortalName"
    />
    <message-input-file-list :class="$style.inputFileList" />
    <message-input-typing-users :typing-users="typingUsers" />
    <message-input-key-guide :show="showKeyGuide" />
    <div :class="$style.inputContainer">
      <message-input-upload-button
        :class="$style.controls"
        @click="addAttachment"
      />
      <message-input-text-area
        :class="$style.inputTextArea"
        :text="textState.text"
        @focus="onFocus"
        @blur="onBlur"
        @input="onInputText"
        @modifier-key-down="onModifierKeyDown"
        @modifier-key-up="onModifierKeyUp"
        @post-message="postMessage"
      />
      <message-input-controls
        :class="$style.controls"
        :can-post-message="canPostMessage"
        @click-send="postMessage"
        @click-stamp="onStampClick"
      />
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  PropType,
  computed
} from '@vue/composition-api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import { ChannelId, DMChannelId } from '@/types/entity-ids'
import useStampPickerInvoker from '@/use/stampPickerInvoker'
import useIsMobile from '@/use/isMobile'
import useAttachments from './use/attachments'
import useTextInput from './use/textInput'
import usePostMessage from './use/postMessage'
import useFocus from './use/focus'
import useEditingStatus from './use/editingStatus'
import MessageInputTypingUsers from './MessageInputTypingUsers.vue'
import MessageInputKeyGuide from './MessageInputKeyGuide.vue'
import MessageInputTextArea from './MessageInputTextArea.vue'
import MessageInputControls from './MessageInputControls.vue'
import MessageInputFileList from './MessageInputFileList.vue'
import MessageInputUploadButton from './MessageInputUploadButton.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.secondary
    }))
  })

export default defineComponent({
  name: 'MessageInput',
  components: {
    MessageInputTypingUsers,
    MessageInputKeyGuide,
    MessageInputTextArea,
    MessageInputControls,
    MessageInputFileList,
    MessageInputUploadButton
  },
  props: {
    channelId: {
      type: String as PropType<ChannelId | DMChannelId>,
      required: true
    }
  },
  setup(props, context) {
    const styles = useStyles()
    const { isMobile } = useIsMobile()
    const {
      textState,
      onInputText,
      onModifierKeyDown,
      onModifierKeyUp
    } = useTextInput()
    const { attachmentsState, addAttachment } = useAttachments()
    const { isFocused, onFocus, onBlur } = useFocus()
    useEditingStatus(
      computed(() => props.channelId),
      textState,
      isFocused
    )

    const { postMessage, isPosting } = usePostMessage(textState, props)

    const typingUsers = computed(
      () => store.getters.domain.messagesView.typingUsers
    )

    const canPostMessage = computed(
      () => !isPosting.value && !(textState.isEmpty && attachmentsState.isEmpty)
    )
    const showKeyGuide = computed(
      () =>
        textState.isModifierKeyPressed &&
        (store.state.app.browserSettings.sendWithModifierKey !== 'modifier' ||
          canPostMessage.value)
    )

    const targetPortalName = 'message-input-stamp-picker'
    const { invokeStampPicker } = useStampPickerInvoker(
      targetPortalName,
      stampData => {
        // TODO: 編集でも使うのでロジックを分離
        const stampName = store.state.entities.stamps[stampData.id]?.name
        if (!stampName) return
        const size = stampData.size ? `.${stampData.size}` : ''
        const effects =
          stampData.effects && stampData.effects.length > 0
            ? `.${stampData.effects.join('.')}`
            : ''
        textState.text += `:${stampName}${size}${effects}:`
      }
    )

    const onStampClick = () => {
      if (store.getters.ui.stampPicker.isStampPickerShown) {
        store.dispatch.ui.stampPicker.closeStampPicker()
      } else {
        invokeStampPicker()
      }
    }

    return {
      targetPortalName,
      styles,
      isMobile,
      typingUsers,
      textState,
      attachmentsState,
      onFocus,
      onBlur,
      onInputText,
      onModifierKeyDown,
      onModifierKeyUp,
      onStampClick,
      postMessage,
      addAttachment,
      showKeyGuide,
      canPostMessage
    }
  }
})
</script>

<style lang="scss" module>
$inputPadding: 32px;
$inputPaddingMobile: 16px;
$radius: 4px;
.container {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;
  padding: 0.5rem 1rem;
  margin: {
    left: $inputPadding;
    right: $inputPadding;
    bottom: 24px - $radius;
  }

  &[data-is-mobile='true'] {
    margin: {
      left: $inputPaddingMobile;
      right: $inputPaddingMobile;
    }
  }

  border-radius: $radius;
  transform: translateY(-$radius);
}
.stampPickerLocator {
  width: 100%;
  position: absolute;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  right: 0;
  top: -8px;
  transform: translateY(-100%);
}
.inputContainer {
  width: 100%;
  display: flex;
  flex-direction: row;
  padding: 8px 16px;
  justify-content: space-between;
  align-items: flex-end;
}
.controls {
  flex: {
    grow: 0;
    shrink: 0;
  }
  margin: 0 16px;

  &:first-child {
    margin-left: 0;
  }

  &:last-child {
    margin-right: 0;
  }
}
</style>
