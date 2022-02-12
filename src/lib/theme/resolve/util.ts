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

export const resolveFromFallback = <T>(
  original: CSSColorTypeSimple | { fallback: CSSColorTypeSimple },
  f: (fallback: string) => T
): T => {
  const fallback = typeof original === 'string' ? original : original.fallback
  return f(fallback)
}
