import type { Dimensions } from './size'

export const loadImage = (url: string) =>
  new Promise<HTMLImageElement>(resolve => {
    const $img = new Image()
    $img.addEventListener(
      'load',
      () => {
        resolve($img)
      },
      { once: true }
    )
    $img.src = url
  })

export const resetCanvas = (
  $canvas: HTMLCanvasElement,
  { width, height }: Readonly<Dimensions>,
  $img?: Readonly<HTMLImageElement>
) => {
  $canvas.getContext('2d')?.clearRect(0, 0, $canvas.width, $canvas.height)
  $canvas.width = width
  $canvas.height = height
  if ($img) {
    $canvas
      .getContext('2d')
      ?.drawImage($img, 0, 0, $canvas.width, $canvas.height)
  }
}

// https://stackoverflow.com/a/52586606
export const deleteCanvas = ($canvas: HTMLCanvasElement) => {
  resetCanvas($canvas, { width: 0, height: 0 })
}
