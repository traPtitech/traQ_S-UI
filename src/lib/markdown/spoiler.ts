export const toggleSpoiler = (element: HTMLElement) => {
  const $spoiler = element.closest('.spoiler')
  $spoiler?.toggleAttribute('shown')
}
