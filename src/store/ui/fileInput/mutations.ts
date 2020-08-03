import { defineMutations } from 'direct-vuex'
import { S, Attachment } from './state'

export const mutations = defineMutations<S>()({
  addAttachment(state, attachment: Attachment) {
    state.attachments.push(attachment)
  },
  removeAttachmentAt(state, index: number) {
    if (0 <= index && index < state.attachments.length) {
      state.attachments.splice(index, 1)
    }
  },
  clearAttachments(state) {
    state.attachments = []
  },
  addThumbnailTo(state, payload: { index: number; thumbnailDataUrl: string }) {
    if (0 <= payload.index && payload.index < state.attachments.length) {
      state.attachments[payload.index].thumbnailDataUrl =
        payload.thumbnailDataUrl
    }
  }
})
