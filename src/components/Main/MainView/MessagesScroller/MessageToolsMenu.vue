<template>
  <div :class="$style.container">
    <span
      v-if="isPinned && !isMinimum"
      :class="$style.text"
      @click="withClose(removePinned)"
    >
      ピン留めを外す
    </span>
    <span
      v-else-if="!isMinimum"
      :class="$style.text"
      @click="withClose(addPinned)"
    >
      ピン留め
    </span>
    <span :class="$style.text" @click="withClose(showClipCreateModal)">
      クリップ
    </span>
    <span
      v-if="isMine && !isMinimum"
      :class="$style.text"
      @click="withClose(editMessage)"
    >
      編集
    </span>
    <span :class="$style.text" @click="withClose(copyLink)">
      リンクをコピー
    </span>
    <span
      v-if="showWidgetCopyButton"
      :class="$style.text"
      @click="withClose(copyEmbedded)"
    >
      メッセージを埋め込む
    </span>
    <span :class="$style.text" @click="withClose(copyMd)">
      Markdownをコピー
    </span>
    <span
      v-if="isMine && !isMinimum"
      :class="$style.text"
      @click="withClose(deleteMessage)"
    >
      削除
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue'
import store from '/@/store'
import apis, { embeddingOrigin } from '/@/lib/apis'
import { MessageId } from '/@/types/entity-ids'
import useToastStore from '/@/providers/toastStore'
import { useMessageContextMenuStore } from './providers/messageContextMenu'
import { replaceBack } from '/@/lib/markdown/internalLinkUnembedder'
import { constructMessagesPath } from '/@/router'

const { showWidgetCopyButton } = window.traQConfig

const useExecWithToast = () => {
  const { addInfoToast, addErrorToast } = useToastStore()

  const execWithToast = async (
    successText: string | undefined,
    errorText: string,
    func: () => void | Promise<void>
  ) => {
    try {
      await func()
      if (successText) {
        addInfoToast(successText)
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(errorText, e)

      addErrorToast(errorText)
    }
  }

  return { execWithToast }
}

const usePinToggler = (props: { messageId: MessageId }) => {
  const { execWithToast } = useExecWithToast()

  const addPinned = async () => {
    execWithToast(undefined, 'ピン留めに失敗しました', async () => {
      await apis.createPin(props.messageId)
    })
  }
  const removePinned = async () => {
    execWithToast(undefined, 'ピン留めの解除に失敗しました', async () => {
      await apis.removePin(props.messageId)
    })
  }
  return { addPinned, removePinned }
}

const useMessageChanger = (props: { messageId: MessageId }) => {
  const { execWithToast } = useExecWithToast()

  const editMessage = () => {
    store.commit.domain.messagesView.setEditingMessageId(props.messageId)
  }
  const deleteMessage = () => {
    if (!confirm('本当にメッセージを削除しますか？')) return

    execWithToast(
      'メッセージを削除しました',
      'メッセージの削除に失敗しました',
      async () => {
        await apis.deleteMessage(props.messageId)
      }
    )
  }
  return { editMessage, deleteMessage }
}

const useCopy = (props: { messageId: MessageId }) => {
  const { execWithToast } = useExecWithToast()

  const copyLink = async () => {
    const link = `${embeddingOrigin}${constructMessagesPath(props.messageId)}`
    execWithToast('コピーしました', 'コピーに失敗しました', () =>
      navigator.clipboard.writeText(link)
    )
  }
  const copyEmbedded = async () => {
    const link = `<iframe src="${embeddingOrigin}/widget/?type=message&id=${props.messageId}" scrolling="no" frameborder="no" width="600"></iframe>`
    execWithToast('コピーしました', 'コピーに失敗しました', () =>
      navigator.clipboard.writeText(link)
    )
  }
  const copyMd = async () => {
    const content =
      store.state.entities.messages.messagesMap.get(props.messageId)?.content ??
      ''
    const replacedContent = replaceBack(content)
    execWithToast('コピーしました', 'コピーに失敗しました', () =>
      navigator.clipboard.writeText(replacedContent)
    )
  }
  return { copyLink, copyEmbedded, copyMd }
}

const useShowClipCreateModal = (props: { messageId: MessageId }) => {
  const showClipCreateModal = () => {
    store.dispatch.ui.modal.pushModal({
      type: 'clip-create',
      messageId: props.messageId
    })
  }
  return { showClipCreateModal }
}

export default defineComponent({
  name: 'MessageToolsMenu',
  props: {
    messageId: {
      type: String as PropType<MessageId>,
      default: ''
    }
  },
  setup(props) {
    const { state, closeContextMenu } = useMessageContextMenuStore()

    const isPinned = computed(
      () =>
        store.state.entities.messages.messagesMap.get(props.messageId)?.pinned
    )
    const isMine = computed(
      () =>
        store.state.entities.messages.messagesMap.get(props.messageId)
          ?.userId === store.getters.domain.me.myId
    )
    const isMinimum = computed(() => state.isMinimum)

    const { copyLink, copyEmbedded, copyMd } = useCopy(props)
    const { addPinned, removePinned } = usePinToggler(props)
    const { editMessage, deleteMessage } = useMessageChanger(props)
    const { showClipCreateModal } = useShowClipCreateModal(props)
    const withClose = async (func: () => void | Promise<void>) => {
      await func()
      closeContextMenu()
    }

    return {
      showWidgetCopyButton,
      isPinned,
      isMine,
      isMinimum,
      addPinned,
      removePinned,
      copyLink,
      copyEmbedded,
      copyMd,
      editMessage,
      deleteMessage,
      showClipCreateModal,
      withClose
    }
  }
})
</script>

<style lang="scss" module>
.container {
  @include background-primary;
  @include color-ui-secondary;
  @include drop-shadow-default;
  display: grid;
  width: max-content;
  padding: 8px 16px;
  border-radius: 4px;
  contain: content;
}

.text {
  margin: 2px 0;
  cursor: pointer;
}
</style>
