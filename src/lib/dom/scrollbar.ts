export const getScrollbarWidth = () => {
  const element = document.createElement('div')
  element.style.visibility = 'hidden'
  element.style.overflow = 'scroll'
  document.body.appendChild(element)

  const scrollbarWidth = element.offsetWidth - element.clientWidth
  element.remove()

  return scrollbarWidth
}
