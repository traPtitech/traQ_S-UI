import store from '@/store'
import { computed, reactive } from '@vue/composition-api'

const useAttachments = () => {
  const state = reactive({
    attachments: computed(() => store.state.ui.fileInput.attachments),
    isEmpty: computed(() => store.getters.ui.fileInput.isEmpty)
  })

  const input = document.createElement('input')
  input.type = 'file'
  input.multiple = true
  input.addEventListener('change', () => {
    for (const file of input.files ?? []) {
      store.dispatch.ui.fileInput.addAttachment(file)
    }
    input.files = null
  })

  const addAttachment = () => {
    input.click()
  }
  return {
    attachmentsState: state,
    addAttachment
  }
}

export default useAttachments
