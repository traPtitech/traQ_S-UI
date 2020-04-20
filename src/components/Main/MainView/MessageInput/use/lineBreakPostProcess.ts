import { reactive } from '@vue/composition-api'

export interface LineBreakPostProcessState {
  shouldRun: boolean
  selectionIndex: number
}

const useLineBreakPostProcess = () => {
  const lineBreakPostProcessState = reactive<LineBreakPostProcessState>({
    shouldRun: false,
    selectionIndex: 0
  })
  const runLineBreakPostProcess = (selectionIndex: number) => {
    lineBreakPostProcessState.shouldRun = true
    lineBreakPostProcessState.selectionIndex = selectionIndex
  }
  const onLineBreakPostProcessDone = () => {
    lineBreakPostProcessState.shouldRun = false
    lineBreakPostProcessState.selectionIndex = 0
  }
  return {
    lineBreakPostProcessState,
    runLineBreakPostProcess,
    onLineBreakPostProcessDone
  }
}

export default useLineBreakPostProcess
