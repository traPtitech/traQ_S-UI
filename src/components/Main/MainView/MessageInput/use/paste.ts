import {
  MessageInputStateKey,
  useMessageInputStateAttachment
} from '@/providers/messageInputState'
import useToastStore from '@/providers/toastStore'

const usePaste = (channelId: MessageInputStateKey) => {
  const { addErrorToast } = useToastStore()
  const { addAttachment } = useMessageInputStateAttachment(
    channelId,
    addErrorToast
  )

  const onPaste = (event: ClipboardEvent) => {
    const dt = event?.clipboardData
    if (dt) {
      Array.from(dt.files).forEach(file => {
        addAttachment(file)
      })
    }
  }
  return { onPaste }
}

export default usePaste
