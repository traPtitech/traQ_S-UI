import {
  MessageInputStateKey,
  useMessageInputStateAttachment
} from '/@/store/ui/messageInputState'
import { useToastStore } from '/@/store/ui/toast'

const readDataFromClipboard = async () => {
  if (!navigator.permissions?.query) return []

  const permissionStatus = await navigator.permissions.query({
    name: 'clipboard-read' as PermissionName // 型に含まれていない
  })
  if (
    permissionStatus.state === 'granted' ||
    permissionStatus.state === 'prompt'
  ) {
    try {
      const data = await navigator.clipboard.read()
      return data
    } catch {
      // 存在しないときもエラーが起きるのでひねりつぶす
      return []
    }
  }
  return []
}

const obtainFilesFromClipboardItems = async (items: ClipboardItems) => {
  const blobPromises = items
    .filter(d => d.types.includes('image/svg+xml'))
    .map(d => d.getType('image/svg+xml'))
  const blobs = await Promise.all(blobPromises)

  // ファイル名がとれないのでダミーの名前をつける
  return blobs.map(blob => new File([blob], 'image.svg', { type: blob.type }))
}

const usePaste = (
  channelId: MessageInputStateKey,
  emit: (name: 'addAttachments', files: File[]) => void,
  insertText: (text: string) => void
) => {
  const { addErrorToast } = useToastStore()
  const { getTextFromHtml } = useMessageInputStateAttachment(
    channelId,
    addErrorToast
  )

  const onPaste = async (event: ClipboardEvent) => {
    const dt = event?.clipboardData
    if (!dt) return

    emit('addAttachments', [...dt.files])

    if (dt.types.includes('image/svg+xml')) {
      // image/svg+xmlはChromeでdt.filesに含まれていない (2021/10/09 Chrome 96.0.4664.2)
      // そのため、async clipboard apiから取る
      const data = await readDataFromClipboard()
      const files = await obtainFilesFromClipboardItems(data)
      emit('addAttachments', files)
    }

    if (dt.types.includes('text/html')) {
      const text = await getTextFromHtml(dt, event)
      insertText(text)
      return
    }
  }
  return { onPaste }
}

export default usePaste
