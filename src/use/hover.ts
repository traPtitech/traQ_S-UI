import { SetupContext, reactive } from '@vue/composition-api'

export type HoverState = {
  hover: boolean
}

const useHover = (context?: SetupContext) => {
  const state: HoverState = reactive({
    hover: false
  })
  const onMouseEnter = () => {
    if (context) {
      context.emit('hover')
    }
    state.hover = true
  }
  const onMouseLeave = () => {
    if (context) {
      context.emit('hover-end')
    }
    state.hover = false
  }
  return {
    hoverState: state,
    onMouseEnter,
    onMouseLeave
  }
}

export default useHover
