import { deleteCanvas, loadImage, resetCanvas } from './canvas'
import { needResize, getThumbnailDimensions } from './size'
import { mimeToFileType } from '/@/lib/basic/file'

export const canResize = (mime: string) =>
  ['image/png', 'image/jpeg'].includes(mime)
export const isJpeg = (mime: string) => mime === 'image/jpeg'

const resize = async (
  inputFile: Readonly<File>
): Promise<File | 'cannot resize' | 'error' | null> => {
  const inputUrl = URL.createObjectURL(inputFile as File)

  const $input = document.createElement('canvas')

  const finish = <T>(result: T) => {
    deleteCanvas($input)
    URL.revokeObjectURL(inputUrl)
    return result
  }

  try {
    const $img = await loadImage(inputUrl)
    const inputSize = {
      width: $img.width,
      height: $img.height
    }
    if (!needResize(inputSize)) {
      return finish(null)
    }

    resetCanvas($input, getThumbnailDimensions(inputSize), $img)

    const output = await new Promise<Blob | null>(resolve => {
      $input.toBlob(resolve, inputFile.type)
    })

    if (output === null) {
      return finish('cannot resize')
    }

    const outputFile = new File([output], inputFile.name, {
      type: inputFile.type,
      lastModified: inputFile.lastModified
    })

    return finish(outputFile)
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(`Failed to generate thumbnail image: ${e}`, e)
    return finish('error')
  }
}

const IMAGE_SIZE_LIMIT = 20 * 1000 * 1000 // 20MB
const FILE_SIZE_LIMIT = 30 * 1000 * 1000 // 30MB

const tooLargeFileMessage =
  window.traQConfig.tooLargeFileMessage ??
  '大きい%sの共有には別のサービスを利用してください。'

const IMAGE_MAX_SIZE_EXCEEDED_MESSAGE = `リサイズ後の画像サイズが20MBを超えています\n${tooLargeFileMessage.replace(
  '%s',
  '画像'
)}`
const FILE_MAX_SIZE_EXCEEDED_MESSAGE = `ファイルサイズは30MBまでです\n${tooLargeFileMessage.replace(
  '%s',
  'ファイル'
)}`

export const getResizedFile = async (file: File) => {
  const fileType = mimeToFileType(file.type)

  if (fileType !== 'image' && file.size > FILE_SIZE_LIMIT) {
    throw new Error(FILE_MAX_SIZE_EXCEEDED_MESSAGE)
  }

  if (fileType !== 'image') {
    return file
  }

  const resizable = canResize(file.type)
  if (!resizable) {
    return file
  }

  const res = await resize(file)

  if (res === 'cannot resize') {
    throw new Error('画像のリサイズに失敗しました')
  }
  if (res === 'error') {
    throw new Error('画像の形式が不正なためサムネイルは生成されません')
  }
  if (res === null) {
    return file
  }
  if (res.size > IMAGE_SIZE_LIMIT) {
    throw new Error(IMAGE_MAX_SIZE_EXCEEDED_MESSAGE)
  }
  return res
}
