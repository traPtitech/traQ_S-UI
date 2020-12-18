import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/_store'
import { fileInput } from './index'
import { mimeToFileType } from '@/lib/util/file'
import { ActionContext } from 'vuex'
import { convertToDataUrl } from '@/lib/resize/dataurl'
import { resize, canResize } from '@/lib/resize'
import config from '@/config'

const imageSizeLimit = 20 * 1000 * 1000 // 20MB
const fileSizeLimit = 30 * 1000 * 1000 // 30MB

export const fileInputActionContext = (
  context: ActionContext<unknown, unknown>
) => moduleActionContext(context, fileInput)

export const actions = defineActions({
  async addAttachment(context, file: File) {
    const { commit, state } = fileInputActionContext(context)
    const fileType = mimeToFileType(file.type)

    if (fileType === 'image' && file.size > imageSizeLimit) {
      window.alert(
        `画像サイズは20MBまでです\n${config.tooLargeFileMessage.replace(
          '%s',
          '画像'
        )}`
      )
      return
    }
    if (file.size > fileSizeLimit) {
      window.alert(
        `画像サイズは30MBまでです\n${config.tooLargeFileMessage.replace(
          '%s',
          'ファイル'
        )}`
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
