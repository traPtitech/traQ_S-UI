<template>
  <div :class="$style.container">
    <span
      v-if="!isMinimum"
      :class="$style.text"
      @click="withClose(removePinned)"
    >
      ピン留めを外す
    </span>
    <span :class="$style.text" @click="withClose(copyLink)">
      リンクをコピー
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue'
import apis, { embeddingOrigin } from '/@/lib/apis'
import { MessageId } from '/@/types/entity-ids'
import useToastStore from '/@/providers/toastStore'
import { useMessageContextMenuStore } from '../providers/messageContextMenu'
import { constructMessagesPath } from '/@/router'

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

  const removePinned = async () => {
    execWithToast(undefined, 'ピン留めの解除に失敗しました', async () => {
      await apis.removePin(props.messageId)
    })
  }
  return { removePinned }
}

const useCopy = (props: { messageId: MessageId }) => {
  const { execWithToast } = useExecWithToast()

  const copyLink = async () => {
    const link = `${embeddingOrigin}${constructMessagesPath(props.messageId)}`
    execWithToast('コピーしました', 'コピーに失敗しました', () =>
      navigator.clipboard.writeText(link)
    )
  }

  return { copyLink }
}

export default defineComponent({
  name: 'SidebarPinnedToolsMenu',
  props: {
    messageId: {
      type: String as PropType<MessageId>,
      default: ''
    }
  },
  setup(props) {
    const { state, closeContextMenu } = useMessageContextMenuStore()

    const isMinimum = computed(() => state.isMinimum)

    const { copyLink } = useCopy(props)
    const { removePinned } = usePinToggler(props)
    const withClose = async (func: () => void | Promise<void>) => {
      await func()
      closeContextMenu()
    }

    return {
      isMinimum,
      removePinned,
      copyLink,
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
