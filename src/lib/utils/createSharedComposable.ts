import { effectScope, onScopeDispose, type EffectScope } from 'vue'
import type { Invocable } from '/@/types/utility'

const createSharedComposable = <Fn extends Invocable>(fn: Fn) => {
  let subscribers = 0
  let state: ReturnType<Fn> | null = null
  let scope: EffectScope | null = null

  const dispose = () => {
    if (--subscribers <= 0) {
      scope?.stop()
      state = scope = null
    }
  }

  const wrapped = (...args: Parameters<Fn>) => {
    ++subscribers

    if (!state) {
      scope = effectScope(true)
      state = scope.run(() => fn(...args)) as ReturnType<Fn>
    }

    onScopeDispose(dispose)

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return state!
  }

  return wrapped
}

export default createSharedComposable
