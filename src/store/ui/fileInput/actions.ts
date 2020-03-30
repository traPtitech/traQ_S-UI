import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/store'
import { fileInput } from './index'
import { AttachmentType } from './state'

export const fileInputActionContext = (context: any) =>
  moduleActionContext(context, fileInput)

const parseFileType = (fileType: string): AttachmentType => {
  if (fileType.startsWith('image/')) {
    return 'image'
  }
  if (fileType.startsWith('audio/')) {
    return 'audio'
  }
  if (fileType.startsWith('video/')) {
    return 'video'
  }
  return 'file'
}

export const actions = defineActions({
  addAttachment(context, file: File) {
    const { commit, state } = fileInputActionContext(context)
    const fileType = parseFileType(file.type)
    if (fileType === 'image') {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      const index = state.attachments.length

      reader.addEventListener('load', event => {
        // `readAsDataURL`を用いるため、結果の型はstring
        // see: https://developer.mozilla.org/ja/docs/Web/API/FileReader/result
        const thumbnailDataUrl = event.target?.result as string
        if (!thumbnailDataUrl) {
          return
        }
        commit.addThumbnailTo({
          index,
          thumbnailDataUrl
        })
      })
    }
    commit.addAttachment({
      type: fileType,
      file
    })
  }
})
