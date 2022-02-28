/**
 * https://www.w3.org/TR/2021/WD-css-color-4-20211215/
 * に基づいた実装
 *
 * ただし、hwb、lab、lch、oklab、oklch、colorには未対応
 */

import { trimEnd } from './string'

export type Color = RGBColor | HSLColor
export type RGBColor = {
  type: 'rgb'
  r: number // 0～255
  g: number // 0～255
  b: number // 0～255
  a: number // 0～1
}
export type HSLColor = {
  type: 'hsl'
  h: number // 0～360
  s: number // 0～1
  l: number // 0～1
  a: number // 0～1
}

const mustConvertHex = (hex: string) => {
  if (!/[0-9A-F]+/.test(hex)) {
    throw new Error('Invalid Hex')
  }
  return parseInt(hex, 16)
}

/**
 * The RGB hexadecimal notations
 */
const parseHexNotationColor = (str: string): RGBColor | null => {
  const len = str.length
  /* eslint-disable @typescript-eslint/no-non-null-assertion */
  if (len === 4 || len === 5) {
    try {
      return {
        type: 'rgb',
        r: (mustConvertHex(str[1]!) / 15) * 255,
        g: (mustConvertHex(str[2]!) / 15) * 255,
        b: (mustConvertHex(str[3]!) / 15) * 255,
        a: mustConvertHex(str[4] ?? 'F') / 15
      } as const
    } catch {
      return null
    }
  }
  if (len === 7 || len === 9) {
    try {
      return {
        type: 'rgb',
        r: mustConvertHex(str.slice(1, 3)),
        g: mustConvertHex(str.slice(3, 5)),
        b: mustConvertHex(str.slice(5, 7)),
        a: mustConvertHex(str.slice(7, 9) || 'FF') / 255
      } as const
    } catch {
      return null
    }
  }
  return null
  /* eslint-enable @typescript-eslint/no-non-null-assertion */
}

const mustConvertNumber = (str: string) => {
  const res = +str
  if (Number.isNaN(res)) {
    throw new Error('Invalid number')
  }
  return res
}

const mustConvertPercentage = (str: string) => {
  if (!str.endsWith('%')) {
    throw new Error('Invalid percentage')
  }
  return mustConvertNumber(trimEnd(str, '%')) / 100
}

const mustConvertPercentageOrNumber = (str: string, range = 1) => {
  const trimed = str.trim()
  if (trimed.endsWith('%')) {
    return mustConvertPercentage(trimed) * range
  }
  return mustConvertNumber(trimed)
}

const angleUnits = {
  deg: 360,
  grad: 400,
  rad: 2 * Math.PI,
  turn: 1
}

/**
 * The <hue> syntax
 */
const mustConvertHue = (str: string) => {
  for (const [unit, turn] of Object.entries(angleUnits)) {
    if (str.endsWith(unit)) {
      return ((mustConvertNumber(trimEnd(str, unit)) % turn) / turn) * 360
    }
  }
  return mustConvertNumber(str) % 360
}

const extractFunctionValuesWithAlpha = (str: string): string[] | null => {
  const valuesOrAlpha = str.split('/')
  if (valuesOrAlpha.length !== 1 && valuesOrAlpha.length !== 2) {
    return null
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const values = valuesOrAlpha[0]!.split(/ +/).filter(v => v !== '')
  values.push(valuesOrAlpha[1] ?? '1')
  return values
}

const parseRGBFunctionColorValues = (
  values: readonly string[]
): RGBColor | null => {
  if (values.length !== 3 && values.length !== 4) {
    return null
  }
  // NOTE: 一部だけ%で一部だけ数値のものは本来invalidだが通るようになっている
  try {
    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    return {
      type: 'rgb',
      r: mustConvertPercentageOrNumber(values[0]!, 255),
      g: mustConvertPercentageOrNumber(values[1]!, 255),
      b: mustConvertPercentageOrNumber(values[2]!, 255),
      a: mustConvertPercentageOrNumber(values[3] ?? '1')
    }
    /* eslint-enable @typescript-eslint/no-non-null-assertion */
  } catch {
    return null
  }
}

/**
 * The RGB functions
 */
const parseRGBFunctionColor = (str: string): RGBColor | null => {
  const m = str.match(/^rgba?\((.+)\)$/)
  if (!m) {
    return null
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const value = m[1]!
  if (value.includes(',')) {
    const values = value.split(',')
    return parseRGBFunctionColorValues(values)
  }

  const values = extractFunctionValuesWithAlpha(value)
  if (values === null) {
    return null
  }
  return parseRGBFunctionColorValues(values)
}

const parseHSLFunctionColorValues = (
  values: readonly string[]
): HSLColor | null => {
  if (values.length !== 3 && values.length !== 4) {
    return null
  }
  try {
    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    return {
      type: 'hsl',
      h: mustConvertHue(values[0]!),
      s: mustConvertPercentage(values[1]!),
      l: mustConvertPercentage(values[2]!),
      a: mustConvertPercentageOrNumber(values[3] ?? '1')
    }
    /* eslint-enable @typescript-eslint/no-non-null-assertion */
  } catch {
    return null
  }
}

/**
 * HSL Colors
 */
const parseHSLFunctionColor = (str: string): HSLColor | null => {
  const m = str.match(/^hsla?\((.+)\)$/)
  if (!m) {
    return null
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const value = m[1]!
  if (value.includes(',')) {
    const values = value.split(',')
    return parseHSLFunctionColorValues(values)
  }

  const values = extractFunctionValuesWithAlpha(value)
  if (values === null) {
    return null
  }
  return parseHSLFunctionColorValues(values)
}

export const parseColor = (str: string): Color | null => {
  if (str.startsWith('#')) {
    return parseHexNotationColor(str)
  }
  if (str.startsWith('rgb')) {
    return parseRGBFunctionColor(str)
  }
  if (str.startsWith('hsl')) {
    return parseHSLFunctionColor(str)
  }
  return null
}

const stringifyRGBColor = (color: RGBColor) => {
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`
}

const stringifyHSLColor = (color: HSLColor) => {
  return `hsla(${color.h}, ${color.s * 100}%, ${color.l * 100}%, ${color.a})`
}

export const stringifyColor = (color: Color): string => {
  switch (color.type) {
    case 'rgb':
      return stringifyRGBColor(color)
    case 'hsl':
      return stringifyHSLColor(color)
    default: {
      const never: never = color
      throw new Error(`Invalid color (${JSON.stringify(never)})`)
    }
  }
}

/**
 * 透過化
 * @param color 色
 * @param opacity 0～1
 */
export const transparentize = (color: string, opacity: number) => {
  const _opacity = Math.max(0, Math.min(1, opacity))
  const c = parseColor(color)
  if (c === null) {
    return c
  }
  c.a *= _opacity
  return stringifyColor(c)
}

/**
 * 透過化
 * パースに失敗したら元の色を返す
 * @param color 色
 * @param opacity 0～1
 */
export const transparentizeWithFallback = (color: string, opacity: number) => {
  const result = transparentize(color, opacity)
  return result ?? color
}

/**
 * その色の輝度が閾値を超えているかどうか
 * @param color 色
 * @param threshold 0～1
 */
export const isDarkColor = (color: string, threshold = 0.5) => {
  const c = parseColor(color)
  if (c === null) {
    return false
  }
  switch (c.type) {
    case 'rgb':
      return (
        (0.298912 * c.r) / 255 +
          (0.586611 * c.g) / 255 +
          (0.114478 * c.b) / 255 <
        threshold
      )
    case 'hsl':
      return c.l < threshold
    default: {
      const never: never = c
      throw new Error(`Invalid color (${JSON.stringify(never)})`)
    }
  }
}
