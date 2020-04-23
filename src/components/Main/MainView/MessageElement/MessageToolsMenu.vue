<template>
  <div :class="$style.container" :style="styles.container">
    <span :class="$style.text" @click="removePinned" v-if="isPinned">
      ピン留めを外す
    </span>
    <span
      :class="$style.text"
      @click="
        addPinned()
        close()
      "
      v-else
    >
      ピン留め
    </span>
    <span
      :class="$style.text"
      @click="
        editMessage()
        close()
      "
      v-if="isMine"
      >編集</span
    >
    <span
      :class="$style.text"
      @click="
        copyLink()
        close()
      "
    >
      リンクをコピー
    </span>
    <span
      :class="$style.text"
      @click="
        copyMd()
        close()
      "
    >
      Markdownをコピー
    </span>
    <span
      :class="$style.text"
      @click="
        deleteMessage()
        close()
      "
      v-if="isMine"
    >
      削除
    </span>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  reactive,
  PropType
} from '@vue/composition-api'
import store from '@/store'
import apis from '@/lib/api'
import { makeStyles } from '@/lib/styles'
import { MessageId } from '@/types/entity-ids'
import { embeddingOrigin } from '@/lib/api'

const useStyles = () =>
  reactive({
    container: makeStyles((theme, common) => ({
      filter: common.dropShadow.default,
      background: theme.background.primary,
      color: theme.ui.secondary
    }))
  })

const usePinToggler = (props: { messageId: MessageId }) => {
  const addPinned = () => {
    store.dispatch.domain.messagesView.addPinned({
      messageId: props.messageId
    })
  }
  const removePinned = () => {
    store.dispatch.domain.messagesView.removePinned({
      messageId: props.messageId
    })
  }
  return { addPinned, removePinned }
}

const useMessageChanger = (props: { messageId: MessageId }) => {
  const editMessage = () => {
    // TODO
    alert('edit: Not implemented')
  }
  const deleteMessage = () => {
    apis.deleteMessage(props.messageId)
  }
  return { editMessage, deleteMessage }
}

const useCopy = (props: { messageId: MessageId }) => {
  const copyLink = async () => {
    const link = `${embeddingOrigin}/messages/${props.messageId}`
    await navigator.clipboard.writeText(link)
  }
  const copyMd = async () => {
    await navigator.clipboard.writeText(
      store.state.entities.messages[props.messageId]?.content ?? ''
    )
  }
  return { copyLink, copyMd }
}

export default defineComponent({
  name: 'MessageToolsMenu',
  props: { messageId: { type: String as PropType<MessageId>, required: true } },
  setup(props) {
    const styles = useStyles()
    const isPinned = computed(() =>
      store.getters.domain.messagesView.isPinned(props.messageId)
    )
    const isMine = computed(
      () =>
        store.state.entities.messages[props.messageId]?.userId ===
        store.state.domain.me.detail?.id
    )
    const { copyLink, copyMd } = useCopy(props)
    const { addPinned, removePinned } = usePinToggler(props)
    const { editMessage, deleteMessage } = useMessageChanger(props)
    const close = () => {
      store.dispatch.ui.messageContextMenu.closeMessageContextMenu()
    }
    return {
      styles,
      isPinned,
      addPinned,
      removePinned,
      copyLink,
      copyMd,
      isMine,
      editMessage,
      deleteMessage,
      close
    }
  }
})
</script>

<style lang="scss" module>
.container {
  display: grid;
  width: max-content;
  padding: 8px 16px;
  border-radius: 4px;
  position: absolute;
}

.text {
  cursor: pointer;
}
</style>
