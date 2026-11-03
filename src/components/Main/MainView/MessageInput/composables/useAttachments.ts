import { useFileSelect } from '/@/composables/dom/useFileSelect'

const useAttachments = (capture: () => (files: File[]) => Promise<void>) => {
  let addAttachments: ReturnType<typeof capture> | undefined

  const { selectImage } = useFileSelect({ multiple: true }, async files => {
    await addAttachments?.([...files])
  })

  return {
    addAttachment: () => {
      addAttachments = capture()
      selectImage()
    }
  }
}

export default useAttachments
