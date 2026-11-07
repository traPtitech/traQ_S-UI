await vi.hoisted(async () => {
  await import('../../fixtures/referenceEntities')
})

vi.mock('/@/store/app/commandPalette', async () => {
  const { computed, ref } = await import('vue')
  const presentation = ref<{ mode: string; focusTarget: string }>()
  const currentInput = ref('')
  const query = ref('')

  return {
    useCommandPalette: () => ({
      presentation,
      currentInput,
      query,
      isCommandPaletteShown: computed(() => !!presentation.value),

      closeCommandPalette: () => {
        presentation.value = undefined
      },

      settleQuery: vi.fn()
    })
  }
})

vi.mock('/@/store/ui/modal', async () => {
  const { ref } = await import('vue')

  return { useModalStore: () => ({ shouldShowModal: ref(false) }) }
})

vi.mock('/@/composables/useResponsive', async () => {
  const { ref } = await import('vue')

  return { default: () => ({ isMobile: ref(false) }) }
})

vi.mock('/@/store/app/browserSettings', async () => {
  const { ref } = await import('vue')
  const sendWithModifierKey = ref('none')

  const modifierKey = ref({
    ctrl: true,
    alt: false,
    shift: true,
    macCtrl: false
  })

  return { useBrowserSettings: () => ({ sendWithModifierKey, modifierKey }) }
})

vi.mock('/@/store/domain/stampHistory', () => ({
  useStampHistory: () => ({ upsertLocalStampHistory: vi.fn() })
}))

vi.mock('/@/store/domain/stampRecommendations', () => ({
  useStampRecommendations: () => ({ recordStampUsage: vi.fn() })
}))

export {}
