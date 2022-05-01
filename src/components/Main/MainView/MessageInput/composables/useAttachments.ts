import { useFileSelect } from '/@/composables/dom/useFileSelect'

const useAttachments = (addAttachment: (file: File) => Promise<void>) => {
  const { selectImage } = useFileSelect({ multiple: true }, async files => {
    for (const file of files ?? []) {
      await addAttachment(file)
    }
  })

  return {
    addAttachment: selectImage
  }
}

export default useAttachments
