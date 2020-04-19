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
    <div :class="$style.inputContainer">
      <message-input-upload-button
        :class="$style.controls"
        @click="addAttachment"
      />
      <message-input-text-area
        :class="$style.inputTextArea"
        :text="textState.text"
        :should-update-size="shouldUpdateSize"
        @input="onInputText"
        @post-message="postMessage"
        @update-size="onUpdateSize"
      />
      <message-input-controls
        :class="$style.controls"
        :can-post-message="!(textState.isEmpty && attachmentsState.isEmpty)"
        @click-send="postMessage"
        @click-stamp="onStampClick"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, PropType } from '@vue/composition-api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import { ChannelId } from '@/types/entity-ids'
import useStampPickerInvoker from '@/use/stampPickerInvoker'
import useIsMobile from '@/use/isMobile'
import useAttachments from './use/attachments'
import useTextInput from './use/textInput'
import usePostMessage from './use/postMessage'
import useTextAreaSizeUpdater from './use/textAreaSizeUpdater'
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
    MessageInputTextArea,
    MessageInputControls,
    MessageInputFileList,
    MessageInputUploadButton
  },
  props: {
    channelId: {
      type: String as PropType<ChannelId>,
      required: true
    }
  },
  setup(props) {
    const styles = useStyles()
    const { isMobile } = useIsMobile()
    const { textState, onInputText } = useTextInput()
    const { attachmentsState, addAttachment } = useAttachments()
    const {
      shouldUpdateSize,
      onUpdateSize,
      onStampInput
    } = useTextAreaSizeUpdater()
    const postMessage = usePostMessage(textState, props)

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
        const stampText = textState.text + `:${stampName}${size}${effects}:`
        textState.text = stampText
        onStampInput()
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
      textState,
      attachmentsState,
      shouldUpdateSize,
      onInputText,
      onStampClick,
      onUpdateSize,
      postMessage,
      addAttachment
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
