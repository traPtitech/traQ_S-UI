import useToggle from '/@/composables/utils/useToggle'

const useHover = (delay: number = 0) => {
  const { value, open, close } = useToggle()
  let timeoutId: NodeJS.Timeout | null = null

  const onMouseEnter = () => {
    if (delay <= 0) {
      open()
    } else {
      timeoutId = setTimeout(() => {
        open()
      }, delay)
    }
  }

  const onMouseLeave = () => {
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
