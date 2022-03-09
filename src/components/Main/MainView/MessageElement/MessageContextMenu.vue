<template>
  <context-menu-container :position="position" @close="close">
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
  </context-menu-container>
</template>

<script lang="ts">
import { defineComponent, computed, PropType, Ref, toRef } from 'vue'
import store from '/@/vuex'
import apis from '/@/lib/apis'
import { MessageId } from '/@/types/entity-ids'
import { replaceBack } from '/@/lib/markdown/internalLinkUnembedder'
import ContextMenuContainer from '/@/components/UI/ContextMenuContainer.vue'
import { Point } from '/@/lib/basic/point'
import useExecWithToast from '/@/use/contextMenu/execWithToast'
import usePinToggler from '/@/use/contextMenu/pinToggler'
import useCopyLink from '/@/use/contextMenu/copyLink'

const { showWidgetCopyButton } = window.traQConfig

const useMessageChanger = (messageId: Ref<MessageId>) => {
  const { execWithToast } = useExecWithToast()

  const editMessage = () => {
    store.commit.domain.messagesView.setEditingMessageId(messageId.value)
  }
  const deleteMessage = () => {
    if (!confirm('本当にメッセージを削除しますか？')) return

    execWithToast(
      'メッセージを削除しました',
      'メッセージの削除に失敗しました',
      async () => {
        await apis.deleteMessage(messageId.value)
      }
    )
  }
  return { editMessage, deleteMessage }
}

const useCopyMd = (messageId: Ref<MessageId>) => {
  const { execWithToast } = useExecWithToast()

  const copyMd = async () => {
    const content =
      store.state.entities.messages.messagesMap.get(messageId.value)?.content ??
      ''
    const replacedContent = replaceBack(content)
    execWithToast('コピーしました', 'コピーに失敗しました', () =>
      navigator.clipboard.writeText(replacedContent)
    )
  }
  return { copyMd }
}

const useShowClipCreateModal = (messageId: Ref<MessageId>) => {
  const showClipCreateModal = () => {
    store.dispatch.ui.modal.pushModal({
      type: 'clip-create',
      messageId: messageId.value
    })
  }
  return { showClipCreateModal }
}

export default defineComponent({
  name: 'MessageContextMenu',
  components: {
    ContextMenuContainer
  },
  props: {
    position: {
      type: Object as PropType<Point>,
      required: true
    },
    messageId: {
      type: String as PropType<MessageId>,
      required: true
    },
    isMinimum: {
      type: Boolean,
      default: false
    }
  },
  emits: {
    close: () => true
  },
  setup(props, { emit }) {
    const messageId = toRef(props, 'messageId')

    const isPinned = computed(
      () =>
        store.state.entities.messages.messagesMap.get(messageId.value)?.pinned
    )
    const isMine = computed(
      () =>
        store.state.entities.messages.messagesMap.get(messageId.value)
          ?.userId === store.getters.domain.me.myId
    )

    const { copyLink, copyEmbedded } = useCopyLink(messageId)
    const { copyMd } = useCopyMd(messageId)
    const { addPinned, removePinned } = usePinToggler(messageId)
    const { editMessage, deleteMessage } = useMessageChanger(messageId)
    const { showClipCreateModal } = useShowClipCreateModal(messageId)

    const close = () => {
      emit('close')
    }
    const withClose = async (func: () => void | Promise<void>) => {
      await func()
      close()
    }

    return {
      showWidgetCopyButton,
      isPinned,
      isMine,
      addPinned,
      removePinned,
      copyLink,
      copyEmbedded,
      copyMd,
      editMessage,
      deleteMessage,
      showClipCreateModal,
      close,
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
