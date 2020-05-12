import { resetCanvas } from './canvas'
import { Dimensions } from './size'
import { blobAsArrayBuffer } from './blob'

type Orientaion = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

export const getOrientation = async (file: File): Promise<Orientaion> => {
  const buffer = await blobAsArrayBuffer(file)
  const dv = new DataView(buffer)
  let app1MarkerStart = 2
  // JFIF with APP0 Marker
  if (dv.getUint16(app1MarkerStart) !== 0xffe1) {
    app1MarkerStart += dv.getUint16(4) + 2
  }
  // without exif
  if (dv.getUint16(app1MarkerStart) !== 0xffe1) {
    return 0
  }

  const isLittleEndian = dv.getUint16(app1MarkerStart + 10) === 0x49
  const fieldCount = dv.getUint16(app1MarkerStart + 18, isLittleEndian)
  for (let i = 0; i < fieldCount; i++) {
    const start = app1MarkerStart + 20 + 12 * i
    const tag = dv.getUint16(start, isLittleEndian)
    // orientaion
    if (tag === 0x0112) {
      return dv.getUint16(start + 8, isLittleEndian) as Orientaion
    }
  }
  return 0
}

export const needDimentionSwap = (orientation: Orientaion) =>
  [5, 6, 7, 8].includes(orientation)

export const resetAndSetRotatedImgToCanvas = (
  $canvas: HTMLCanvasElement,
  { width, height }: Dimensions,
  $img: HTMLImageElement,
  orientation: Orientaion
) => {
  if (needDimentionSwap(orientation)) {
    // 縦横入れ替え
    resetCanvas($canvas, { width: height, height: width })
  } else {
    resetCanvas($canvas, { width, height })
  }

  const ctx = $canvas.getContext('2d')
  if (!ctx) return

  switch (orientation) {
    case 2:
      ctx.transform(-1, 0, 0, 1, width, 0)
      break
    case 3:
      ctx.transform(-1, 0, 0, -1, width, height)
      break
    case 4:
      ctx.transform(1, 0, 0, -1, 0, height)
      break
    case 5:
      ctx.transform(0, 1, 1, 0, 0, 0)
      break
    case 6:
      ctx.transform(0, 1, -1, 0, height, 0)
      break
    case 7:
      ctx.transform(0, -1, -1, 0, height, width)
      break
    case 8:
      ctx.transform(0, -1, 1, 0, 0, width)
      break
  }
  ctx.drawImage($img, 0, 0)
}
