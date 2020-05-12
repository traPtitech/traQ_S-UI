import { start, finish, initVars } from './vars'
import { loadImage, resetCanvas } from './canvas'
import { needResize, getThumbnailDimensions } from './size'
import {
  resetAndSetRotatedImgToCanvas,
  needDimentionSwap,
  getOrientation
} from './orientation'
import { isIOS } from '../util/browser'

export const canResize = (mime: string) =>
  ['image/png', 'image/jpeg'].includes(mime)
const isJpeg = (mime: string) => mime === 'image/jpeg'
const iOSFlag = isIOS()

export const resize = async (inputFile: File): Promise<File | null> => {
  start()
  const { pica, $input, $output, $img } = await initVars()

  const inputUrl = URL.createObjectURL(inputFile)

  try {
    await loadImage(inputUrl, $img)
    const inputSize = {
      width: $img.width,
      height: $img.height
    }
    if (!needResize(inputSize)) {
      return finish(null, inputUrl)
    }

    // iOSでは画像の回転を手動適用
    if (iOSFlag && isJpeg(inputFile.type)) {
      const orientation = await getOrientation(inputFile)
      resetAndSetRotatedImgToCanvas($input, inputSize, $img, orientation)
      // resetAndSetRotatedImgToCanvas内では入れ替え前の値がほしいため、そのあとで行う
      if (needDimentionSwap(orientation)) {
        ;[inputSize.width, inputSize.height] = [
          inputSize.height,
          inputSize.width
        ]
      }
    } else {
      resetCanvas($input, inputSize, $img)
    }

    const outputSize = getThumbnailDimensions(inputSize)
    resetCanvas($output, outputSize)
    await pica.resize($input, $output, {
      quality: 2
    })

    const output = await pica.toBlob($output, 'image/png')
    const outputFile = new File([output], inputFile.name, {
      type: inputFile.type,
      lastModified: inputFile.lastModified
    })

    return finish(outputFile, inputUrl)
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(`Failed to generate thumbnail image: ${e}`, e)
    return finish(null, inputUrl)
  }
}
