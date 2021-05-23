// eslint-disable-next-line @typescript-eslint/ban-types
export type S = {
  /** 検索履歴 新しい順に並ぶ */
  searchHistories: string[] //TODO 型
}

export const state: S = {
  searchHistories: []
}
