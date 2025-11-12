import useToggle from '/@/composables/utils/useToggle'

const useHover = (delay: number = 0) => {
  const { value, open, close } = useToggle()
  let timeoutId: NodeJS.Timeout | null = null
  let shouldOpen = false

  const onMouseEnter = () => {
    shouldOpen = true

    if (delay <= 0) {
      open()
    } else {
      if (timeoutId) clearTimeout(timeoutId)

      timeoutId = setTimeout(() => {
        timeoutId = null
        if (shouldOpen) open()
      }, delay)
    }
  }

  const onMouseLeave = () => {
    shouldOpen = false

    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }

    close()
  }

  return {
    onMouseEnter,
    onMouseLeave,
    isHovered: value
  }
}

export default useHover
