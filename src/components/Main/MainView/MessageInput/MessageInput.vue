<template>
  <div :class="$style.container" :style="styles.container">
    <message-input-file-list :class="$style.inputFileList" />
    <div :class="$style.inputContainer">
      <message-input-upload-button
        :class="$style.controls"
        @click="addAttachment"
      />
      <message-input-text-area
        :text="textState.text"
        :class="$style.inputTextArea"
        @input-text="onInputText"
        @post-message="postMessage"
      />
      <message-input-controls
        :class="$style.controls"
        :can-post-message="!(textState.isEmpty && attachmentsState.isEmpty)"
        @click-send="postMessage"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, reactive } from '@vue/composition-api'
import store from '@/store'
import api, { buildFilePath } from '@/lib/api'
import { makeStyles } from '@/lib/styles'
import { ChannelId } from '@/types/entity-ids'
import MessageInputTextArea from './MessageInputTextArea.vue'
import MessageInputControls from './MessageInputControls.vue'
import MessageInputFileList from './MessageInputFileList.vue'
import MessageInputUploadButton from './MessageInputUploadButton.vue'
import { Attachment } from '@/store/ui/fileInput/state'

type Props = {
  channelId: ChannelId
}

type TextState = {
  text: string
  isEmpty: boolean
}

const useText = () => {
  const state: TextState = reactive({
    text: '',
    isEmpty: computed(() => state.text.length === 0)
  })
  const onInputText = (text: string) => {
    state.text = text
  }
  return {
    textState: state,
    onInputText
  }
}

const useAttachments = () => {
  const state = reactive({
    attachments: computed(() => store.state.ui.fileInput.attachments),
    isEmpty: computed(() => store.getters.ui.fileInput.isEmpty)
  })

  const input = document.createElement('input')
  input.type = 'file'
  input.multiple = true
  input.addEventListener('change', () => {
    for (const file of input.files ?? []) {
      store.dispatch.ui.fileInput.addAttachment(file)
    }
    input.files = null
  })

  const addAttachment = () => {
    input.click()
  }
  return {
    attachmentsState: state,
    addAttachment
  }
}

const usePostMessage = (textState: TextState, props: Props) => {
  const postMessage = async () => {
    if (textState.text.length === 0) return
    const attachments = store.state.ui.fileInput.attachments
    try {
      const responses = await Promise.all(
        attachments.map(attachment =>
          api.postFile(attachment.file, props.channelId)
        )
      )
      const fileUrls = responses.map(res => buildFilePath(res.data.id))
      const embededdUrls = fileUrls.join('\n')
      await api.postMessage(props.channelId, {
        content: textState.text + '\n' + embededdUrls
      })
      textState.text = ''
      store.commit.ui.fileInput.clearAttachments()
    } catch {
      // TODO: エラー処理
    }
  }
  return postMessage
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
    const { textState, onInputText } = useText()
    const { attachmentsState, addAttachment } = useAttachments()
    const postMessage = usePostMessage(textState, props)
    return {
      styles,
      textState,
      attachmentsState,
      onInputText,
      postMessage,
      addAttachment
    }
  }
})
</script>

<style lang="scss" module>
.container {
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-bottom: 24px;
  border-radius: 4px;
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
