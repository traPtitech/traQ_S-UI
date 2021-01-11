import useMessageInputState, {
  MessageInputStateKey
} from '@/providers/messageInputState'

const useAttachments = (channelId: MessageInputStateKey) => {
  const { addAttachment } = useMessageInputState(channelId)

  const input = document.createElement('input')
  input.type = 'file'
  input.multiple = true

  const onChange = () => {
    for (const file of input.files ?? []) {
      addAttachment(file)
    }
    // `input.files = null`ではリセットできない
    input.value = ''
  }

  input.addEventListener('change', onChange)

  const startAddingAttachment = () => {
    input.click()
  }

  const destroy = () => {
    input.removeEventListener('change', onChange)
  }

  return {
    addAttachment: startAddingAttachment,
    destroy
  }
}

export default useAttachments
