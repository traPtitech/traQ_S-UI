import useToggle from '/@/composables/useToggle'

export type EffectSelectorState = {
  shouldShowEffectSelector: boolean
}

const useEffectSelector = () => {
  const { value: shouldShowEffectSelector, toggle: toggleShowEffect } =
    useToggle(false)
  return { shouldShowEffectSelector, toggleShowEffect }
}

export default useEffectSelector
