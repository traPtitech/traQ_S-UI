import type { CallableWith } from '/@/types/utility'

interface Options<State> {
  getState: () => State
  setState: CallableWith<[State]>
  execute: CallableWith<[State]>
}

/**
 * optimistic updates を簡単に行うための関数を生成する
 *
 * UI の応答性を向上させるため非同期処理の終了を待たずに状態を即座に更新し，
 * 失敗した場合は元の状態にロールバックする．
 *
 * @template State: 管理する状態の型
 *
 * @param options.getState: 現在の状態を取得する関数
 * @param options.setState: 状態を設定する関数
 * @param options.execute: 実際の非同期処理（API呼び出しなど）を実行する関数
 */
const createOptimisticUpdater = <State>({
  getState,
  setState,
  execute
}: Options<State>) => {
  const update = async (newState: State) => {
    const previousState = getState()
    setState(newState)

    try {
      await execute(newState)
    } catch {
      setState(previousState)
    }
  }

  return update
}

export default createOptimisticUpdater
