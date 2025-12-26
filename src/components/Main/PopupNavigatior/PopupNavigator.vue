<template>
  <button
    :id="popupNavigatorButtonId"
    ref="buttonEle"
    :class="$style.navigationButton"
  >
    <AIcon name="traQ" :size="28" />
    <teleport :to="`#${popupNavigatorId}`">
      <div
        v-show="isPopupNavigatorShown"
        :class="$style.popupNavigator"
        :style="popupStyle"
      >
        <div :class="$style.popupNavigatorItem" @click="movePrev">
          <AIcon name="arrow-left" mdi :class="$style.icon" />
          戻る
        </div>
        <div :class="$style.popupNavigatorItem" @click="moveNext">
          <AIcon name="arrow-right" mdi :class="$style.icon" />
          進む
        </div>
      </div>
    </teleport>
  </button>
</template>

<script lang="ts">
import { computed, reactive, readonly, shallowRef, watch } from 'vue'
import { useRouter } from 'vue-router'

import useEventListener from '/@/composables/dom/useEventListener'
import useToggle from '/@/composables/utils/useToggle'

const popupNavigatorButtonId = 'popup-navigation-button'
const popupNavigatorId = 'popup-navigator'
const POPUP_MARGIN = 4
const LONG_CLICK_DELAY = 150

type PointerEventHandler = (e: PointerEvent) => void

const useWindowPointer = (
  {
    onPointerDown,
    onPointerUp
  }: {
    onPointerDown: PointerEventHandler
    onPointerUp: PointerEventHandler
  },
  options?: boolean | AddEventListenerOptions | undefined
) => {
  useEventListener(window, 'pointerdown', onPointerDown, options)
  useEventListener(window, 'pointerup', onPointerUp, options)
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
  let isClickStarted = false

  const onPointerDown = (e: PointerEvent) => {
    if (!isTarget(e.target)) return
    // スワイプを無効化するため
    e.stopPropagation()

    isClickStarted = true

    timer = window.setTimeout(() => {
      isLongClicking = true
      onLongClick()
    }, LONG_CLICK_DELAY)
  }

  const onPointerUp = (e: PointerEvent) => {
    // document.elementFromPointが起きるとレイアウトの計算がかかるので、
    // targetでのmousetouchstartが起きていないなら無視する
    if (!isClickStarted) return

    isClickStarted = false
    window.clearTimeout(timer)

    const target = document.elementFromPoint(e.clientX, e.clientY)
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
  return { onPointerDown, onPointerUp }
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

  const { onPointerDown, onPointerUp } = useIsLongClicking(
    isTarget,
    showPopupNavigator,
    () => {
      emit('clickIcon')
    }
  )

  useWindowPointer(
    {
      onPointerDown: e => {
        if (!isPopup(e.target)) {
          hidePopupNavigator()
        }
        onPointerDown(e)
      },
      onPointerUp
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
  position: fixed;
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
