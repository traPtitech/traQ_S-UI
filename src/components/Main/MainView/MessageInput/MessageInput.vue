<template>
  <div :class="$style.container" :style="styles.container">
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
        :text="textState.text"
        :class="$style.inputTextArea"
        @input="onInputText"
        @post-message="postMessage"
      />
      <message-input-controls
        :class="$style.controls"
        :can-post-message="!(textState.isEmpty && attachmentsState.isEmpty)"
        @click-send="postMessage"
        @click-stamp="invokeStampPicker"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import { ChannelId } from '@/types/entity-ids'
import useStampPickerInvoker from '@/use/stampPickerInvoker'
import useAttachments from './use/attachments'
import useTextInput, { TextState } from './use/textInput'
import usePostMessage from './use/postMessage'
import MessageInputTextArea from './MessageInputTextArea.vue'
import MessageInputControls from './MessageInputControls.vue'
import MessageInputFileList from './MessageInputFileList.vue'
import MessageInputUploadButton from './MessageInputUploadButton.vue'

export type Props = {
  channelId: ChannelId
}

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
      type: String,
      required: true
    }
  },
  setup(props: Props) {
    const styles = useStyles()
    const { textState, onInputText } = useTextInput()
    const { attachmentsState, addAttachment } = useAttachments()
    const postMessage = usePostMessage(textState, props)

    const targetPortalName = 'message-input-stamp-picker'
    const { invokeStampPicker } = useStampPickerInvoker(targetPortalName, s =>
      console.log(s)
    )

    return {
      targetPortalName,
      styles,
      textState,
      attachmentsState,
      onInputText,
      invokeStampPicker,
      postMessage,
      addAttachment
    }
  }
})
</script>

<style lang="scss" module>
.container {
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  margin-bottom: 24px;
  border-radius: 4px;
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
