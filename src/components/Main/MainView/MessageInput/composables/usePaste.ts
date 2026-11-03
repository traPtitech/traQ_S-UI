import { getTextFromHtml } from '/@/lib/dom/dataTransfer'

const readSvgFiles = async (): Promise<File[]> => {
  try {
    if (!navigator.permissions?.query || !navigator.clipboard?.read) return []

    const permission = await navigator.permissions.query({
      name: 'clipboard-read' as PermissionName
    })
    if (permission.state === 'denied') return []

    const items = await navigator.clipboard.read()
    const blobs = await Promise.allSettled(
      items
        .filter(item => item.types.includes('image/svg+xml'))
        .map(item => item.getType('image/svg+xml'))
    )

    return blobs.flatMap(result =>
      result.status === 'fulfilled'
        ? [new File([result.value], 'image.svg', { type: result.value.type })]
        : []
    )
  } catch {
    return []
  }
}

export const readPaste = (event: ClipboardEvent) => {
  const data = event.clipboardData
  if (!data) return

  const plainText = data.getData('text/plain')
  const hasHtml = data.types.includes('text/html')
  const files = [...data.files]

  if (hasHtml) event.preventDefault()

  return {
    text: hasHtml ? getTextFromHtml(data).catch(() => plainText) : undefined,
    files: data.types.includes('image/svg+xml')
      ? readSvgFiles().then(svg => [...files, ...svg])
      : files
  }
}

const usePaste = (
  emit: (name: 'addAttachments', files: File[] | Promise<File[]>) => void
) => {
  const preparePaste = (event: ClipboardEvent) => {
    const result = readPaste(event)
    if (!result) return

    if (!Array.isArray(result.files) || result.files.length)
      emit('addAttachments', result.files)
    return result.text
  }

  return { preparePaste }
}

export default usePaste
