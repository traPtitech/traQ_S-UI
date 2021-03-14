/**
 * クリックした要素の祖先の.spoilerを探してshown属性をtoggleする
 * @returns 実際にtoggleしたかどうか
 */
export const toggleSpoiler = (element: HTMLElement) => {
  const $spoiler = element.closest('.spoiler')
  $spoiler?.toggleAttribute('shown')
  return $spoiler !== null
}
