import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/store'
import { fileInput } from './index'
import { mimeToFileType } from '@/lib/util/file'
import { ActionContext } from 'vuex'
import { convertToDataUrl } from '@/lib/resize/dataurl'
import { resize, canResize } from '@/lib/resize'

const imageSizeLimit = 20 * 1000 * 1000 // 20MB

export const fileInputActionContext = (
  context: ActionContext<unknown, unknown>
) => moduleActionContext(context, fileInput)

export const actions = defineActions({
  async addAttachment(context, file: File) {
    const { commit, state } = fileInputActionContext(context)
    const fileType = mimeToFileType(file.type)

    if (fileType === 'image' && file.size > imageSizeLimit) {
      window.alert(
        '画像サイズは20MBまでです\n大きい画像の共有にはDriveを使用してください'
      )
      return
    }

    if (fileType === 'image') {
      const resizable = canResize(file.type)

      let resizedFile = file
      if (resizable) {
        resizedFile = (await resize(file)) ?? file
      }

      const thumbnailDataUrl = await convertToDataUrl(resizedFile)
      if (!thumbnailDataUrl) return

      // 最後に追加されたもの(awaitよりあとで行わないと上書きしてしまう)
      const index = state.attachments.length

      commit.addAttachment({
        type: fileType,
        file: resizedFile
      })
      commit.addThumbnailTo({
        index,
        thumbnailDataUrl
      })
    } else {
      commit.addAttachment({
        type: fileType,
        file
      })
    }
  }
})
