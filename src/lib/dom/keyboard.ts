/** IME が処理したキーイベント。変換の開始・確定の境界も含む。 */
export const isComposingKeyEvent = (event: KeyboardEvent) => {
  if (event.isComposing || event.key === 'Process') return true

  // IME の開始・確定時には isComposing が false になる実装があるため、互換処理を残す。
  // https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event#keydown_events_with_ime
  return event.keyCode === 229
}
