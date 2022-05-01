import type { Ref } from 'vue'

const acceptImageType = ['image/jpeg', 'image/png', 'image/gif'].join(',')

export const useImageUploadInternal = (data: Ref<File | undefined>) => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = acceptImageType

  input.addEventListener('change', () => {
    if (input.files) {
      data.value = input.files[0]
    }
    // `input.files = null`ではリセットできない
    input.value = ''
  })

  const selectImage = () => {
    input.click()
  }

  return { selectImage }
}
