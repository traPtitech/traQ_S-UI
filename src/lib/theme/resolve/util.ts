import type { CSSColorType, CSSColorTypeSimple } from '/@/lib/theme/schema'

export type OnlyDefault<T> = {
  default: T
}

export const resolveOnlyDefault = (
  original: CSSColorTypeSimple
): OnlyDefault<CSSColorType> => ({ default: original })

export const resolveWithFallback = <
  T extends { fallback: CSSColorTypeSimple },
  S
>(
  original: T | CSSColorTypeSimple,
  f: (originalObj: T | undefined, fallback: string) => S
) => {
  if (typeof original === 'string') {
    return f(undefined, original)
  }
  return f(original, original.fallback)
}
