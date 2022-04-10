import type { AnimeEffect, SizeEffect } from '@traptitech/traq-markdown-it'
import { computed, ref } from 'vue'
import useToggle from '/@/composables/utils/useToggle'

const useEffectSelector = () => {
  const { value: shouldShowEffectSelector, toggle: toggleShowEffect } =
    useToggle(false)

  const selectedSizeEffect = ref<SizeEffect>()
  const selectedAnimeEffects = ref<AnimeEffect[]>([])

  const hasEffect = computed(
    () =>
      selectedSizeEffect.value !== undefined ||
      selectedAnimeEffects.value.length > 0
  )

  return {
    shouldShowEffectSelector,
    selectedSizeEffect,
    selectedAnimeEffects,
    hasEffect,
    toggleShowEffect
  }
}

export default useEffectSelector
