// eslint-disable-next-line @typescript-eslint/ban-types
export type S = {
  /** 検索履歴 新しい順に並ぶ */
  messageSearchHistories: string[]
}

export const state: S = {
  messageSearchHistories: []
}
