import type { Invocable } from '/@/types/utility'

export const setFallbackForNullishOrOnError = <T>(fallback: T) => {
  const exec = <Fn extends Invocable>(
    fn: Fn
  ): NonNullable<ReturnType<Fn>> | T => {
    try {
      return fn() ?? fallback
    } catch (_e) {
      return fallback
    }
  }

  return { exec }
}
