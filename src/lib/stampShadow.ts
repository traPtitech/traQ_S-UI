import { buildFilePath } from '/@/lib/apis'
import type { FileId } from '/@/types/entity-ids'

const sampleSize = 32
const luminanceLevels = 64
const maxCachedOutlines = 1024

type StampOutline = {
  luminanceCounts: Uint16Array
  pixelCount: number
  isGif: boolean
}

const outlines = new Map<FileId, Promise<StampOutline | undefined>>()
let context: CanvasRenderingContext2D | null = null

const linearize = (channel: number) => {
  const srgb = channel / 255
  return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4
}

export const getRelativeLuminance = (r: number, g: number, b: number) =>
  0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b)

export const waitForStampAnalysisIdle = () =>
  new Promise<void>(resolve => {
    if (typeof requestIdleCallback === 'function') {
      requestIdleCallback(() => resolve())
    } else {
      setTimeout(resolve, 16)
    }
  })

const sampleOutline = (bitmap: ImageBitmap, isGif: boolean) => {
  if (!context) {
    const canvas = document.createElement('canvas')
    canvas.width = sampleSize
    canvas.height = sampleSize
    context = canvas.getContext('2d', { willReadFrequently: true })
  }

  if (!context) return

  const scale = sampleSize / Math.max(bitmap.width, bitmap.height)
  const width = bitmap.width * scale
  const height = bitmap.height * scale
  context.clearRect(0, 0, sampleSize, sampleSize)
  context.drawImage(
    bitmap,
    (sampleSize - width) / 2,
    (sampleSize - height) / 2,
    width,
    height
  )

  const { data } = context.getImageData(0, 0, sampleSize, sampleSize)
  const luminanceCounts = new Uint16Array(luminanceLevels)
  let pixelCount = 0
  const alphaAt = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= sampleSize || y >= sampleSize) return 0
    return data[(y * sampleSize + x) * 4 + 3] ?? 0
  }

  for (let y = 0; y < sampleSize; y++) {
    for (let x = 0; x < sampleSize; x++) {
      if (alphaAt(x, y) < 192) continue
      if (
        alphaAt(x - 1, y) >= 128 &&
        alphaAt(x + 1, y) >= 128 &&
        alphaAt(x, y - 1) >= 128 &&
        alphaAt(x, y + 1) >= 128
      ) {
        continue
      }

      const pixel = (y * sampleSize + x) * 4
      const luminance = getRelativeLuminance(
        data[pixel] ?? 0,
        data[pixel + 1] ?? 0,
        data[pixel + 2] ?? 0
      )
      const level = Math.round(luminance * (luminanceLevels - 1))
      luminanceCounts[level] = (luminanceCounts[level] ?? 0) + 1
      pixelCount++
    }
  }

  if (pixelCount > 0) return { luminanceCounts, pixelCount, isGif }
}

const loadOutline = async (fileId: FileId) => {
  const response = await fetch(buildFilePath(fileId), { cache: 'force-cache' })
  if (!response.ok) throw new Error('Failed to load stamp image')

  const image = await response.blob()
  const bitmap = await createImageBitmap(image)

  try {
    await waitForStampAnalysisIdle()
    return sampleOutline(bitmap, image.type === 'image/gif')
  } finally {
    bitmap.close()
  }
}

const getOutline = (fileId: FileId) => {
  const cached = outlines.get(fileId)
  if (cached) {
    outlines.delete(fileId)
    outlines.set(fileId, cached)
    return cached
  }

  const outline = loadOutline(fileId).catch(() => {
    if (outlines.get(fileId) === outline) outlines.delete(fileId)
    return undefined
  })
  outlines.set(fileId, outline)

  if (outlines.size > maxCachedOutlines) {
    const oldest = outlines.keys().next().value
    if (oldest !== undefined) outlines.delete(oldest)
  }

  return outline
}

export const getStampShadow = async (
  fileId: FileId,
  backgroundLuminance: number
) => {
  const outline = await getOutline(fileId)
  if (!outline) return

  let lowContrastPixels = 0

  for (const [index, count] of outline.luminanceCounts.entries()) {
    const luminance = index / (luminanceLevels - 1)
    const contrast =
      (Math.max(luminance, backgroundLuminance) + 0.05) /
      (Math.min(luminance, backgroundLuminance) + 0.05)
    if (contrast < 2) lowContrastPixels += count
  }

  if (lowContrastPixels * 4 >= outline.pixelCount) return 'strong'

  // 明るい最初のフレームだけで GIF の縁取りを外すと、後続のフレームが背景に溶けることがある。
  if (!outline.isGif) return 'none'
}
