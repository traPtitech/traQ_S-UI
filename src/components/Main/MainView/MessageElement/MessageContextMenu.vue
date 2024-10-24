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
        メッセージリンクをコピー
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
import type { Ref } from 'vue'
import { computed, toRef } from 'vue'
import apis from '/@/lib/apis'
import type { MessageId } from '/@/types/entity-ids'
import { replaceBack } from '/@/lib/markdown/internalLinkUnembedder'
import type { Point } from '/@/lib/basic/point'
import useExecWithToast from '/@/composables/toast/useExecWithToast'
import usePinToggler from '/@/composables/contextMenu/usePinToggler'
import useCopyLink from '/@/composables/contextMenu/useCopyLink'
import { useMeStore } from '/@/store/domain/me'
import { useModalStore } from '/@/store/ui/modal'
import { useMessagesStore } from '/@/store/entities/messages'
import { useMessageEditingStateStore } from '/@/store/ui/messageEditingStateStore'
import useCopyText from '/@/composables/toast/useCopyText'

const useMessageChanger = (messageId: Ref<MessageId>) => {
  const { execWithToast } = useExecWithToast()
  const { editingMessageId } = useMessageEditingStateStore()

  const editMessage = () => {
    editingMessageId.value = messageId.value
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
  const { messagesMap } = useMessagesStore()
  const { copyText } = useCopyText()

  const copyMd = async () => {
    const content = messagesMap.value.get(messageId.value)?.content ?? ''
    const replacedContent = replaceBack(content)
    copyText(replacedContent, 'Markdown')
  }
  return { copyMd }
}

const useShowClipCreateModal = (messageId: Ref<MessageId>) => {
  const { pushModal } = useModalStore()
  const showClipCreateModal = () => {
    pushModal({
      type: 'clip-create',
      messageId: messageId.value
    })
  }
  return { showClipCreateModal }
}
</script>

<script lang="ts" setup>
import ContextMenuContainer from '/@/components/UI/ContextMenuContainer.vue'

const props = withDefaults(
  defineProps<{
    position: Point
    messageId: MessageId
    isMinimum?: boolean
  }>(),
  {
    isMinimum: false
  }
)

const emit = defineEmits<{
  (e: 'close'): void
}>()

const { showWidgetCopyButton } = window.traQConfig

const messageId = toRef(props, 'messageId')
const { myId } = useMeStore()
const { messagesMap } = useMessagesStore()

const isPinned = computed(() => messagesMap.value.get(messageId.value)?.pinned)
const isMine = computed(
  () => messagesMap.value.get(messageId.value)?.userId === myId.value
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
