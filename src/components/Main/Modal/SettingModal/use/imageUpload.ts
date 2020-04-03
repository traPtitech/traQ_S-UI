import { reactive } from '@vue/composition-api'

const useImageUpload = () => {
  const image = reactive({
    data: undefined as File | undefined,
    url: ''
  })

  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*' //TODO: 厳密る
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

  const addImage = () => {
    input.click()
  }
  return { image, addImage }
}

export default useImageUpload
