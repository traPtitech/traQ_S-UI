import { type ComputedRef } from 'vue'
import useToggle from '/@/composables/utils/useToggle'

type Options<LongHoverDuration> = {
  longHoverDuration?: LongHoverDuration
}

type Return<IncludeIsLongHovered extends boolean> = {
  onMouseEnter: () => void
  onMouseLeave: () => void
  isHovered: ComputedRef<boolean>
} & (IncludeIsLongHovered extends true
  ? {
      isLongHovered: ComputedRef<boolean>
    }
  : void)

function useHover(options?: Options<undefined>): Return<false>
function useHover(options?: Options<number>): Return<true>

function useHover({ longHoverDuration }: Options<number | undefined> = {}) {
  const { value: isHovered, open: hoverStart, close: hoverEnd } = useToggle()

  const {
    value: isLongHovered,
    open: longHoverStart,
    close: longHoverEnd
  } = longHoverDuration
    ? useToggle()
    : { value: void 0, open: () => void 0, close: () => void 0 }

  let hoverTimeout: NodeJS.Timeout | null = null

  const onMouseEnter = () => {
    hoverStart()

    if (!longHoverDuration) return

    hoverTimeout = setTimeout(() => {
      if (isHovered.value) {
        longHoverStart()
      }
    }, longHoverDuration)
  }

  const onMouseLeave = () => {
    hoverEnd()
    longHoverEnd()

    if (hoverTimeout) clearTimeout(hoverTimeout)
  }

  return {
    onMouseEnter,
    onMouseLeave,
    isHovered,
    ...(longHoverDuration ? { isLongHovered } : {})
  } as Return<boolean>
}

export default useHover
