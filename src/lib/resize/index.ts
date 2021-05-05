import { start, finish, initVars } from './vars'
import { loadImage, resetCanvas } from './canvas'
import { needResize, getThumbnailDimensions, Dimensions } from './size'
import { isIOS } from '../util/browser'

export const canResize = (mime: string) =>
  ['image/png', 'image/jpeg'].includes(mime)
export const isJpeg = (mime: string) => mime === 'image/jpeg'

const iOSFlag = isIOS()
// iOSではcanvasサイズの上限が決まっているため
// Canvas area exceeds the maximum limit (width * height > 16777216).
const cannotResizeWhenIOS = ({ width, height }: Readonly<Dimensions>) =>
  iOSFlag && width * height > 16777216

export const resize = async (
  inputFile: Readonly<File>
): Promise<File | 'cannot resize' | 'error' | null> => {
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

    if (cannotResizeWhenIOS(inputSize)) {
      return finish('cannot resize', inputUrl)
    }

    const outputSize = getThumbnailDimensions(inputSize)
    resetCanvas($output, outputSize)
    await pica.resize($input, $output, {
      quality: 2,
      alpha: true
    })

    const output = await pica.toBlob($output, inputFile.type)
    const outputFile = new File([output], inputFile.name, {
      type: inputFile.type,
      lastModified: inputFile.lastModified
    })

    return finish(outputFile, inputUrl)
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(`Failed to generate thumbnail image: ${e}`, e)
    return finish('error', inputUrl)
  }
}
