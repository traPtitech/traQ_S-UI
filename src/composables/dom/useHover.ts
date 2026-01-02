import useToggle from '/@/composables/utils/useToggle'

const useHover = (delay: number = 0) => {
  const { value, open, close } = useToggle()
  let timeoutId: NodeJS.Timeout | null = null
  let hoverTarget: EventTarget | null = null

  const onMouseEnter = (e?: MouseEvent) => {
    hoverTarget = e?.currentTarget ?? null

    if (delay <= 0) {
      open()
    } else {
      if (timeoutId) clearTimeout(timeoutId)

      timeoutId = setTimeout(() => {
        timeoutId = null

        // 実際にまだホバー中かどうかを確認（要素がある場合のみ）
        if (hoverTarget instanceof Element && !hoverTarget.matches(':hover')) {
          return
        }

        open()
      }, delay)
    }
  }

  const onMouseLeave = () => {
    hoverTarget = null

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
