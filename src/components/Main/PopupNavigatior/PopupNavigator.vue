<template>
  <button
    :id="popupNavigatorButtonId"
    ref="buttonEle"
    :class="$style.navigationButton"
  >
    <a-icon name="traQ" :size="28" />
    <teleport :to="`#${popupNavigatorId}`">
      <div
        v-show="isPopupNavigatorShown"
        :class="$style.popupNavigator"
        :style="popupStyle"
      >
        <div :class="$style.popupNavigatorItem" @click="movePrev">
          <a-icon name="arrow-left" mdi :class="$style.icon" />
          戻る
        </div>
        <div :class="$style.popupNavigatorItem" @click="moveNext">
          <a-icon name="arrow-right" mdi :class="$style.icon" />
          進む
        </div>
      </div>
    </teleport>
  </button>
</template>

<script lang="ts">
import {
  reactive,
  shallowRef,
  watch,
  computed,
  onMounted,
  onUnmounted,
  readonly
} from 'vue'
import { useRouter } from 'vue-router'
import useToggle from '/@/composables/utils/useToggle'

const popupNavigatorButtonId = 'popup-navigation-button'
const popupNavigatorId = 'popup-navigator'
const POPUP_MARGIN = 4
const LONG_CLICK_DELAY = 150

type MouseTouchEventHandler = (e: MouseEvent | TouchEvent) => void

const useWindowMouseTouch = (
  {
    onMouseTouchStart,
    onMouseTouchEnd
  }: {
    onMouseTouchStart: MouseTouchEventHandler
    onMouseTouchEnd: MouseTouchEventHandler
  },
  options?: boolean | AddEventListenerOptions | undefined
) => {
  onMounted(() => {
    window.addEventListener('mousedown', onMouseTouchStart, options)
    window.addEventListener('touchstart', onMouseTouchStart, options)
    window.addEventListener('mouseup', onMouseTouchEnd, options)
    window.addEventListener('touchend', onMouseTouchEnd, options)
  })
  onUnmounted(() => {
    window.removeEventListener('mousedown', onMouseTouchStart, options)
    window.removeEventListener('touchstart', onMouseTouchStart, options)
    window.removeEventListener('mouseup', onMouseTouchEnd, options)
    window.removeEventListener('touchend', onMouseTouchEnd, options)
  })
}

/**
 * タッチにも対応している
 */
const useIsLongClicking = (
  isTarget: (t: EventTarget | null) => t is Element,
  onLongClick: () => void,
  onClick: () => void
) => {
  let isLongClicking = false
  let timer = 0

  const onMouseTouchStart = (e: MouseEvent | TouchEvent) => {
    if (!isTarget(e.target)) return
    // スワイプを無効化するため
    e.stopPropagation()

    timer = window.setTimeout(() => {
      isLongClicking = true
      onLongClick()
    }, LONG_CLICK_DELAY)
  }
  const onMouseTouchEnd = (e: MouseEvent | TouchEvent) => {
    window.clearTimeout(timer)

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const point = 'changedTouches' in e ? e.changedTouches[0]! : e
    const target = document.elementFromPoint(point.clientX, point.clientY)
    if (!isTarget(target)) {
      return
    }

    if (!isLongClicking) {
      onClick()
    } else {
      let t = target
      while (!(t instanceof HTMLElement)) {
        if (t.parentElement === null) {
          throw new Error('Missing HTMLElement parent')
        }
        t = t.parentElement
      }
      t.click()
    }
    isLongClicking = false
  }
  return { onMouseTouchStart, onMouseTouchEnd }
}

const useNavigator = (emit: (name: 'clickIcon') => void) => {
  const router = useRouter()

  const isTarget = (t: EventTarget | null): t is Element => {
    const target = t as Element | null
    return (
      target !== null &&
      (target.closest(`#${popupNavigatorButtonId}`) !== null ||
        target.closest(`#${popupNavigatorId}`) !== null)
    )
  }
  const isPopup = (t: EventTarget | null): t is Element => {
    const target = t as Element | null
    return target !== null && target.closest(`#${popupNavigatorId}`) !== null
  }

  const {
    value: isPopupNavigatorShown,
    open: showPopupNavigator,
    close: hidePopupNavigator
  } = useToggle()

  const movePrev = () => {
    router.back()
    hidePopupNavigator()
  }
  const moveNext = () => {
    router.forward()
    hidePopupNavigator()
  }

  const { onMouseTouchStart, onMouseTouchEnd } = useIsLongClicking(
    isTarget,
    showPopupNavigator,
    () => {
      emit('clickIcon')
    }
  )
  useWindowMouseTouch(
    {
      onMouseTouchStart: e => {
        if (!isPopup(e.target)) {
          hidePopupNavigator()
        }
        onMouseTouchStart(e)
      },
      onMouseTouchEnd
    },
    // capture=trueなのはstopPropergationでスワイプを無効化するため
    { capture: true, passive: true }
  )

  return {
    isPopupNavigatorShown: readonly(isPopupNavigatorShown),
    isTarget,
    isPopup,
    showPopupNavigator,
    hidePopupNavigator,
    movePrev,
    moveNext
  }
}
</script>

<script lang="ts" setup>
import AIcon from '/@/components/UI/AIcon.vue'

const emit = defineEmits<{
  (e: 'clickIcon'): void
}>()

const { isPopupNavigatorShown, movePrev, moveNext } = useNavigator(emit)

const position = reactive({ top: 0, left: 0 })
const popupStyle = computed(() => ({
  top: `${position.top}px`,
  left: `${position.left}px`
}))

const buttonEle = shallowRef<HTMLButtonElement>()
watch(isPopupNavigatorShown, newIsPopupNavigatorShown => {
  if (!newIsPopupNavigatorShown || !buttonEle.value) return

  const { bottom, left } = buttonEle.value.getBoundingClientRect()
  position.top = bottom + POPUP_MARGIN
  position.left = left + POPUP_MARGIN
})
</script>

<style lang="scss" module>
.navigationButton {
  display: flex;
  justify-content: center;
  align-items: center;
}
.popupNavigator {
  @include color-ui-primary;
  @include background-primary;
  @include drop-shadow-default;
  position: absolute;
  border-radius: 4px;
  user-select: none;
  white-space: nowrap;
  z-index: $z-index-header-popup-navigator;
}
.popupNavigatorItem {
  padding: 12px 20px;
  cursor: pointer;
  &:hover {
    @include background-secondary;
  }
}
.icon {
  vertical-align: middle;
}
</style>
