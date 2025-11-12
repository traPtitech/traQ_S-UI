import { onBeforeUnmount } from 'vue'

import type { MaybePromise } from '/@/types/utility'

type FileSelectOptions = {
  accept?: string
  multiple?: boolean
}

export const useFileSelect = (
  options: FileSelectOptions,
  onChange: (files: FileList) => MaybePromise<void>
) => {
  const input = document.createElement('input')
  input.type = 'file'
  if (options.accept) {
    input.accept = options.accept
  }
  if (options.multiple) {
    input.multiple = options.multiple
  }

  const onChangeInternal = async () => {
    if (input.files) {
      await onChange(input.files)
    }
    // `input.files = null`ではリセットできない
    input.value = ''
  }

  input.addEventListener('change', onChangeInternal)
  onBeforeUnmount(() => {
    input.removeEventListener('change', onChangeInternal)
  })

  const selectImage = () => {
    input.click()
  }

  return { selectImage }
}
