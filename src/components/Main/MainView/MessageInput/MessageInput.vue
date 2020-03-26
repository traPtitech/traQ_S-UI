<template>
  <div :class="$style.container" :style="styles.container">
    <message-input-file-list :class="$style.inputFileList" />
    <div :class="$style.inputContainer">
      <message-input-text-area
        :text="textState.text"
        :class="$style.inputTextArea"
        @input-text="onInputText"
        @post-message="postMessage"
      />
      <message-input-controls
        :class="$style.controls"
        :can-post-message="!textState.isEmpty"
        @click-send="postMessage"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, reactive } from '@vue/composition-api'
import store from '@/store'
import api from '@/lib/api'
import { makeStyles } from '@/lib/styles'
import { ChannelId } from '@/types/entity-ids'
import MessageInputTextArea from './MessageInputTextArea.vue'
import MessageInputControls from './MessageInputControls.vue'
import MessageInputFileList from './MessageInputFileList.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.secondary
    }))
  })

type TextState = {
  text: string
  isEmpty: boolean
}
type Props = {
  channelId: ChannelId
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

const usePostMessage = (textState: TextState, props: Props) => {
  const postMessage = async () => {
    if (textState.text.length === 0) return
    try {
      await api.postMessage(props.channelId, {
        content: textState.text
      })
      textState.text = ''
    } catch {
      // TODO: エラー処理
    }
  }
  return postMessage
}

export default defineComponent({
  name: 'MessageInput',
  components: {
    MessageInputTextArea,
    MessageInputControls,
    MessageInputFileList
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
    const postMessage = usePostMessage(textState, props)
    return {
      styles,
      textState,
      onInputText,
      postMessage
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
}
</style>
