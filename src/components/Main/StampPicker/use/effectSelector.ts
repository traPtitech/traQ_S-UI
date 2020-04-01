import { reactive } from '@vue/composition-api'

export type EffectSelectorState = {
  shouldShowEffectSelector: boolean
}

const useEffectSelector = () => {
  const state: EffectSelectorState = reactive({
    shouldShowEffectSelector: false
  })
  const toggleShowEffect = () => {
    state.shouldShowEffectSelector = !state.shouldShowEffectSelector
  }
  return { effectSelectorState: state, toggleShowEffect }
}

export default useEffectSelector
