import { SetupContext, reactive } from '@vue/composition-api'

export type HoverState = {
  hover: boolean
}

const useHover = (context: SetupContext, emitEvent = false) => {
  const state: HoverState = reactive({
    hover: false
  })
  const onMouseEnter = () => {
    if (emitEvent) {
      context.emit('hover')
    }
    state.hover = true
  }
  const onMouseLeave = () => {
    if (emitEvent) {
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
