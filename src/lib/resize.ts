const MAX_HEIGHT = 720
const MAX_WIDTH = 1280

interface Dimensions {
  width: number
  height: number
}

const needResize = ({ width, height }: Dimensions) =>
  MAX_WIDTH < width || MAX_HEIGHT < height

const loadPica = async () => {
  const Pica = (await import('pica')).default
  return new Pica()
}

const loadImage = (url: string, $img: HTMLImageElement): Promise<string> => {
  return new Promise(resolve => {
    $img.addEventListener(
      'load',
      () => {
        resolve()
      },
      { once: true }
    )
    $img.src = url
  })
}

const getThumbnailDimensions = ({ width, height }: Dimensions): Dimensions => {
  const widthRatio = width / MAX_WIDTH
  const heightRatio = height / MAX_HEIGHT
  const ratio = Math.max(widthRatio, heightRatio)
  return { width: width / ratio, height: height / ratio }
}

const resetCanvas = (
  $canvas: HTMLCanvasElement,
  { width, height }: Dimensions,
  $img?: HTMLImageElement
) => {
  $canvas.getContext('2d')?.clearRect(0, 0, $canvas.width, $canvas.height)
  $canvas.width = width
  $canvas.height = height
  if ($img) {
    $canvas.getContext('2d')?.drawImage($img, 0, 0)
  }
}

export const resizeAll = async (
  inputDataUrlStrings: string[]
): Promise<Array<Blob | null>> => {
  const pica = await loadPica()
  const $input = document.createElement('canvas')
  const $output = document.createElement('canvas')
  const $img = new Image()
  const outputs = []

  for (const inputDataUrlString of inputDataUrlStrings) {
    try {
      await loadImage(inputDataUrlString, $img)
      const inputSize = {
        width: $img.width,
        height: $img.height
      }
      if (!needResize(inputSize)) {
        outputs.push(null)
        continue
      }

      const outputSize = getThumbnailDimensions(inputSize)

      resetCanvas($input, inputSize, $img)
      resetCanvas($output, outputSize)

      await pica.resize($input, $output, {
        quality: 2
      })
      const outputBlob = await pica.toBlob($output, 'image/png')
      outputs.push(outputBlob)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn(`Failed to generate thumbnail image: ${e}`, e)
      outputs.push(null)
    }
  }

  return outputs
}
