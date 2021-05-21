// eslint-disable-next-line @typescript-eslint/ban-types
export type S = {
  /** 検索履歴 */
  searchHistories: string[] //TODO 型
}

export const state: S = {
  searchHistories: []
}
