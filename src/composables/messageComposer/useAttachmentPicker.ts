import { useFileSelect } from '/@/composables/dom/useFileSelect'

const useAttachmentPicker = (
  capture: () => (files: File[]) => Promise<void>
) => {
  let addAttachments: ReturnType<typeof capture> | undefined

  const { selectImage } = useFileSelect({ multiple: true }, async files => {
    await addAttachments?.([...files])
  })

  return {
    openAttachmentPicker: () => {
      addAttachments = capture()
      selectImage()
    }
  }
}

export default useAttachmentPicker
