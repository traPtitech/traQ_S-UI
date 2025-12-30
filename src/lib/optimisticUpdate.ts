import type { MaybePromise } from '/@/types/utility'

interface Options<State, Args extends unknown[]> {
  getState: (...args: Args) => State
  setState: (state: State, ...args: Args) => unknown
  execute: (state: State, ...args: Args) => MaybePromise<unknown>
}

const createOptimisticUpdater = <State, Args extends unknown[]>({
  getState,
  setState,
  execute
}: Options<State, Args>) => {
  const update = async (newState: State, ...args: Args) => {
    const previousState = getState(...args)
    setState(newState, ...args)

    try {
      await execute(newState, ...args)
    } catch {
      setState(previousState, ...args)
    }
  }

  return update
}

export default createOptimisticUpdater
