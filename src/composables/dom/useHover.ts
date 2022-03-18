import useToggle from '/@/composables/utils/useToggle'

const useHover = () => {
  const {
    value: isHovered,
    open: onMouseEnter,
    close: onMouseLeave
  } = useToggle()
  return {
    isHovered,
    onMouseEnter,
    onMouseLeave
  }
}

export default useHover
