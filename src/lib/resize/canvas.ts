import { Dimensions } from './size'

export const loadImage = (
  url: string,
  $img: HTMLImageElement
): Promise<string> => {
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

export const resetCanvas = (
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
