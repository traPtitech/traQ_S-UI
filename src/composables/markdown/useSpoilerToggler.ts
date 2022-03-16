import { toggleSpoiler } from '/@/lib/markdown/spoiler'

const useSpoilerToggler = () => {
  const toggleSpoilerHandler = (event: MouseEvent) => {
    if (!event.target) return
    const toggled = toggleSpoiler(event.target as HTMLElement)
    if (toggled) {
      event.stopPropagation()
    }
  }

  return { toggleSpoilerHandler }
}

export default useSpoilerToggler
