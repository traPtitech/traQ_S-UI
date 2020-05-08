import { start, finish, initVars } from './vars'
import { loadImage, resetCanvas } from './canvas'
import { needResize, getThumbnailDimensions } from './size'

export const canResize = (mime: string) =>
  ['image/png', 'image/jpeg'].includes(mime)

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

    const outputSize = getThumbnailDimensions(inputSize)

    resetCanvas($input, inputSize, $img)
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
