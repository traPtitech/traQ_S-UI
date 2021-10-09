import {
  MessageInputStateKey,
  useMessageInputStateAttachment
} from '/@/providers/messageInputState'
import useToastStore from '/@/providers/toastStore'

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

const usePaste = (channelId: MessageInputStateKey) => {
  const { addErrorToast } = useToastStore()
  const { addAttachment, addMarkdownGeneratedFromHtml } =
    useMessageInputStateAttachment(channelId, addErrorToast)

  const onPaste = async (event: ClipboardEvent) => {
    const dt = event?.clipboardData
    if (!dt) return

    Array.from(dt.files).forEach(file => {
      addAttachment(file)
    })

    if (dt.types.includes('image/svg+xml')) {
      // image/svg+xmlはChromeでdt.filesに含まれていない (2021/10/09 Chrome 96.0.4664.2)
      // そのため、async clipboard apiから取る
      const data = await readDataFromClipboard()
      const files = await obtainFilesFromClipboardItems(data)
      files.forEach(file => {
        addAttachment(file)
      })
    }

    addMarkdownGeneratedFromHtml(dt, event)
  }
  return { onPaste }
}

export default usePaste
