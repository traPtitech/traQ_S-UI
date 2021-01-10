import {
  provide,
  inject,
  reactive,
  computed,
  readonly,
  Ref,
  ref,
  watch,
  InjectionKey
} from 'vue'
import { StampSet } from '@/components/Main/StampPicker/use/stampSetSelector'
import { StampId } from '@/types/entity-ids'

const stampPickerStoreSymbol: InjectionKey<StampPickerStore> = Symbol()

enum StampEffect {
  wiggle = 'wiggle',
  rotate = 'rotate'
}
enum StampSize {
  small = 'small',
  large = 'large',
  exLarge = 'ex-large'
}

export type SelectedStampData = {
  id: StampId
  effects?: StampEffect[]
  size?: StampSize
}
export type StampSelectHandler = (stamp: SelectedStampData) => void
// eslint-disable-next-line @typescript-eslint/no-empty-function
export const defaultSelectHandler = (_: SelectedStampData) => {}

export interface Place {
  x: number
  y: number
}
export type AlignmentPosition = 'top-right' | 'bottom-right'

interface StampPickerStore {
  selectHandler: StampSelectHandler
  currentStampSet: StampSet
  position: Place | undefined
  alignment: AlignmentPosition
}

const createStampPickerStore = () => {
  return reactive<StampPickerStore>({
    selectHandler: defaultSelectHandler,
    currentStampSet: {
      type: 'history',
      id: ''
    },
    position: undefined,
    alignment: 'top-right'
  })
}

export const provideStampPickerStore = () => {
  provide(stampPickerStoreSymbol, createStampPickerStore())
}

const useStampPickerBase = () => {
  const stampPickerStore = inject(stampPickerStoreSymbol)
  if (!stampPickerStore) {
    throw new Error('useStampPickerStore() was called without provider.')
  }

  const isStampPickerShown = computed(
    () => stampPickerStore.position !== undefined
  )

  const closeStampPicker = () => {
    stampPickerStore.selectHandler = defaultSelectHandler
    stampPickerStore.position = undefined
  }

  return { stampPickerStore, isStampPickerShown, closeStampPicker }
}

/**
 * スタンプピッカーそのもので利用
 */
export const useStampPickerStore = () => {
  const {
    stampPickerStore,
    isStampPickerShown,
    closeStampPicker
  } = useStampPickerBase()

  const setCurrentStampSet = (set: StampSet) => {
    stampPickerStore.currentStampSet = set
  }

  return {
    state: readonly(stampPickerStore),
    isStampPickerShown,
    setCurrentStampSet,
    closeStampPicker
  }
}

const MARGIN_BETWEEN = 4
const getTopRightPosition = (rect: DOMRect) => ({
  x: rect.right,
  y: rect.top - MARGIN_BETWEEN
})
const getBottomRightPosition = (rect: DOMRect) => ({
  x: rect.right,
  y: rect.bottom + MARGIN_BETWEEN
})

/**
 * スタンプピッカーを表示させる側で利用
 *
 * @param element スタンプピッカーを表示する基準となる要素
 * @param alignment その要素の四隅のどの点の位置にスタンプピッカーの右上が来るかを指定する
 */
export const useStampPickerInvoker = (
  selectHandler: StampSelectHandler,
  element: Ref<HTMLElement | undefined>,
  alignment: AlignmentPosition = 'top-right'
) => {
  const {
    stampPickerStore,
    isStampPickerShown,
    closeStampPicker
  } = useStampPickerBase()

  const isThisOpen = ref(false)
  watch(isStampPickerShown, newShown => {
    if (isThisOpen.value && !newShown) {
      isThisOpen.value = false
    }
  })

  const openStampPicker = () => {
    if (!element.value) return

    const rect = element.value.getBoundingClientRect()
    const position =
      alignment === 'top-right'
        ? getBottomRightPosition(rect)
        : alignment === 'bottom-right'
        ? getTopRightPosition(rect)
        : rect // never

    stampPickerStore.selectHandler = selectHandler
    stampPickerStore.position = position
    stampPickerStore.alignment = alignment

    isThisOpen.value = true
  }

  const toggleStampPicker = () => {
    if (isStampPickerShown.value) {
      closeStampPicker()
    } else {
      openStampPicker()
    }
  }

  return { isThisOpen, openStampPicker, closeStampPicker, toggleStampPicker }
}
