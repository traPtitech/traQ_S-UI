import store from '@/_store'
import { computed, reactive } from 'vue'

const useAttachments = () => {
  const state = reactive({
    attachments: computed(() => store.state.ui.fileInput.attachments),
    isEmpty: computed(() => store.getters.ui.fileInput.isEmpty)
  })

  const input = document.createElement('input')
  input.type = 'file'
  input.multiple = true

  const onChange = () => {
    for (const file of input.files ?? []) {
      store.dispatch.ui.fileInput.addAttachment(file)
    }
    // `input.files = null`ではリセットできない
    input.value = ''
  }

  input.addEventListener('change', onChange)

  const addAttachment = () => {
    input.click()
  }

  const destroy = () => {
    input.removeEventListener('change', onChange)
  }

  return {
    attachmentsState: state,
    addAttachment,
    destroy
  }
}

export default useAttachments
