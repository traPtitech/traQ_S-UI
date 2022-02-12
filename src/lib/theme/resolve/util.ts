import { CSSColorType, CSSColorTypeSimple } from '/@/types/theme'

export type OnlyDefault<T> = {
  default: T
}

export const resolveOnlyDefault = (
  original: CSSColorTypeSimple
): OnlyDefault<CSSColorType> => ({ default: original })

export const passThroughOrResolve = <T>(
  original: T | string,
  f: (original: string) => T
): T => {
  if (typeof original === 'string') {
    return f(original)
  }
  return original
}
