import type { AnimeEffect, SizeEffect } from '@traptitech/traq-markdown-it'
import { defineStore, acceptHMRUpdate } from 'pinia'
import { throttle } from 'throttle-debounce'
import { computed, Ref, ref, watch, watchEffect } from 'vue'
import { StampSet } from '/@/components/Main/StampPicker/composables/useStampSetSelector'
import { Point } from '/@/lib/basic/point'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'
import { StampId } from '/@/types/entity-ids'

export type SelectedStampData = {
  id: StampId
  size?: SizeEffect // TODO
  effects?: AnimeEffect[] // TODO
}
export type StampSelectHandler = (stamp: SelectedStampData) => void
// eslint-disable-next-line @typescript-eslint/no-empty-function
export const defaultSelectHandler = (_: SelectedStampData) => {}

export type AlignmentPosition = `top-${'left' | 'right'}` | 'bottom-right'

const MARGIN_BETWEEN = 4
const getBottomLeftPosition = (rect: DOMRect) => ({
  x: rect.left,
  y: rect.bottom + MARGIN_BETWEEN
})
const getTopRightPosition = (rect: DOMRect) => ({
  x: rect.right,
  y: rect.top - MARGIN_BETWEEN
})
const getBottomRightPosition = (rect: DOMRect) => ({
  x: rect.right,
  y: rect.bottom + MARGIN_BETWEEN
})

const getPositionFromAlignment = (
  alignment: AlignmentPosition,
  rect: DOMRect
): Point => {
  // alignmentと関数名が異なることに注意
  // 例えば、左上を合わせたいなら基準となる要素の左下の位置がほしいため
  switch (alignment) {
    case 'top-left':
      return getBottomLeftPosition(rect)
    case 'top-right':
      return getBottomRightPosition(rect)
    case 'bottom-right':
      return getTopRightPosition(rect)
  }
}

const useStampPickerPinia = defineStore('ui/stampPicker', () => {
  const selectHandler = ref<StampSelectHandler>(defaultSelectHandler)
  const currentStampSet = ref<StampSet>({
    type: 'history',
    id: ''
  })
  const position = ref<Point>()
  const alignment = ref<AlignmentPosition>('top-right')

  const isStampPickerShown = computed(() => position.value !== undefined)

  const closeStampPicker = () => {
    selectHandler.value = defaultSelectHandler
    position.value = undefined
  }

  return {
    selectHandler,
    currentStampSet,
    position,
    alignment,
    isStampPickerShown,
    closeStampPicker
  }
})

export const useStampPicker = convertToRefsStore(useStampPickerPinia)

/**
 * スタンプピッカーを表示させる側で利用
 *
 * @param element スタンプピッカーを表示する基準となる要素
 * @param newAlignment その要素の四隅のどの点の位置にスタンプピッカーの右上が来るかを指定する
 */
export const useStampPickerInvoker = (
  newSelectHandler: StampSelectHandler,
  element: Ref<HTMLElement | undefined>,
  newAlignment: AlignmentPosition = 'top-right'
) => {
  const {
    selectHandler,
    position,
    alignment,
    isStampPickerShown,
    closeStampPicker
  } = useStampPicker()

  const isThisOpen = ref(false)
  watch(isStampPickerShown, newShown => {
    if (isThisOpen.value && !newShown) {
      isThisOpen.value = false
    }
  })

  const setPosition = throttle(100, () => {
    if (!element.value) return

    const rect = element.value.getBoundingClientRect()
    position.value = getPositionFromAlignment(newAlignment, rect)
  })

  watchEffect(() => {
    if (isThisOpen.value) {
      window.addEventListener('resize', setPosition)
    } else {
      window.removeEventListener('resize', setPosition)
    }
  })

  const openStampPicker = () => {
    setPosition()
    selectHandler.value = newSelectHandler
    alignment.value = newAlignment

    isThisOpen.value = true
  }

  const toggleStampPicker = () => {
    if (isStampPickerShown.value) {
      closeStampPicker()
    } else {
      openStampPicker()
    }
  }

  return {
    isThisOpen,
    openStampPicker,
    closeStampPicker,
    toggleStampPicker
  }
}

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useStampPickerPinia, import.meta.hot))
}
