import { reactive } from 'vue'

const acceptImageType = ['image/jpeg', 'image/png', 'image/gif'].join(',')

export const useImageUploadInternal = (onImageSelect: () => void) => {
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
    // `input.files = null`ではリセットできない
    input.value = ''
  })
  input.addEventListener('change', onImageSelect, { once: true })

  const addImage = () => {
    input.click()
  }
  const destroy = () => {
    if (image.data) {
      image.data = undefined
    }
    if (image.url !== '') {
      URL.revokeObjectURL(image.url)
      image.url = ''
    }
    input.addEventListener('change', onImageSelect, { once: true })
  }

  return { image, addImage, destroy }
}

export interface ImageUploadState {
  imgData: File | undefined
  destroyFlag: boolean
}

const useImageUpload = () => {
  const state: ImageUploadState = reactive({
    imgData: undefined,
    destroyFlag: false
  })

  const onNewImgSet = (file: File) => {
    state.imgData = file
  }

  const onNewDestroyed = () => {
    state.destroyFlag = false
  }

  const destroy = () => {
    state.imgData = undefined
    state.destroyFlag = true
  }

  return {
    imageUploadState: state,
    onNewImgSet,
    onNewDestroyed,
    destroyImageUploadState: destroy
  }
}

export default useImageUpload
