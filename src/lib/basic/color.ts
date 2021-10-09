/**
 * 透過化
 * @param color 色
 * @param opacity 0～1
 */
export const transparentize = (color: string, opacity: number) => {
  const _opacity = Math.max(0, Math.min(1, opacity))
  const c = Color.fromText(color)
  return new Color(c.r, c.g, c.b, c.a * _opacity).toString()
}

/**
 * その色の輝度が閾値を超えているかどうか
 * @param color 色
 * @param threshold 0～1
 */
export const isDarkColor = (color: string, threshold = 0.5) => {
  const c = Color.fromText(color)
  return (
    (0.298912 * c.r) / 255 + (0.586611 * c.g) / 255 + (0.114478 * c.b) / 255 <
    threshold
  )
}

class Color {
  constructor(
    readonly r: number,
    readonly g: number,
    readonly b: number,
    readonly a: number
  ) {
    if (
      r < 0 ||
      255 < r ||
      g < 0 ||
      255 < g ||
      b < 0 ||
      255 < b ||
      a < 0 ||
      1 < a
    ) {
      throw 'Invalid color'
    }
  }
  toString() {
    return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`
  }
  static fromText(color: string, fallbackOpacity = 1) {
    if (color.startsWith('#')) {
      return Color.fromHex(color, fallbackOpacity)
    }
    if (color.startsWith('rgba')) {
      return Color.fromRgba(color)
    }
    if (color.startsWith('rgb')) {
      return Color.fromRgb(color, fallbackOpacity)
    }
    throw `Invalid color: ${color}`
  }
  static fromHex(hex: string, opacity = 1) {
    const match = hex.match(/#([\da-fA-F]{2})([\da-fA-F]{2})([\da-fA-F]{2})/)
    // 3桁はダメ
    if (!match) throw `Invalid color: ${hex}`
    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    const r = parseInt(match[1]!, 16)
    const g = parseInt(match[2]!, 16)
    const b = parseInt(match[3]!, 16)
    /* eslint-enable @typescript-eslint/no-non-null-assertion */
    return new Color(r, g, b, opacity)
  }
  static fromRgba(rgba: string) {
    const match = rgba.match(
      /rgba\(\s*([\d.]),\s*([\d.]),\s*([\d.]),\s*([\d.])\s*\)/
    )
    if (!match) throw `Invalid color: ${rgba}`
    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    const r = parseInt(match[1]!, 16)
    const g = parseInt(match[2]!, 16)
    const b = parseInt(match[3]!, 16)
    const a = parseInt(match[4]!)
    /* eslint-enable @typescript-eslint/no-non-null-assertion */
    return new Color(r, g, b, a)
  }
  static fromRgb(rgb: string, opacity = 1) {
    const match = rgb.match(/rgb\(\s*([\d.]),\s*([\d.]),\s*([\d.])\s*\)/)
    if (!match) throw `Invalid color: ${rgb}`
    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    const r = parseInt(match[1]!, 16)
    const g = parseInt(match[2]!, 16)
    const b = parseInt(match[3]!, 16)
    /* eslint-enable @typescript-eslint/no-non-null-assertion */
    return new Color(r, g, b, opacity)
  }
}
