import { reactive } from '@vue/composition-api'

const acceptImageType = ['image/jpeg', 'image/png', 'image/gif'].join()

const useImageUpload = (onImageSelect: () => void) => {
  const image = reactive({
    data: undefined as File | undefined,
    url: ''
  })

  const input = document.createElement('input')
  input.type = 'file'
  input.accept = acceptImageType
  input.addEventListener('change', () => {
    if (input.files) {
      image.data = input.files[0]

      if (image.url !== '') {
        URL.revokeObjectURL(image.url)
      }
      if (image.data) {
        image.url = URL.createObjectURL(image.data)
      }
    }
  })
  input.addEventListener('change', onImageSelect, { once: true })

  const addImage = () => {
    input.click()
  }
  return { image, addImage }
}

export default useImageUpload
