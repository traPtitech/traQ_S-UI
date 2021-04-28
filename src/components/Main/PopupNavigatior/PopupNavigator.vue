<template>
  <!-- touchstartをstopしているのはスワイプを無効化するため -->
  <button
    v-if="isMobile"
    :id="popupNavigatorButtonId"
    :class="$style.navigationButton"
    @touchstart.stop="onMouseTouchStart"
    @mousedown="onMouseTouchStart"
    @touchend="onMouseTouchEnd"
    @mouseup="onMouseTouchEnd"
  >
    <icon name="traQ" :size="28" />
    <div v-show="isLongClicking" :class="$style.popupNavigator">
      <div :class="$style.popupNavigatorItem" @click="movePrev">
        <icon name="arrow-left" mdi :class="$style.icon" />
        戻る
      </div>
      <div :class="$style.popupNavigatorItem" @click="moveNext">
        <icon name="arrow-right" mdi :class="$style.icon" />
        進む
      </div>
    </div>
  </button>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import Icon from '@/components/UI/Icon.vue'
import useIsMobile from '@/use/isMobile'
import { useRouter } from 'vue-router'

const popupNavigatorButtonId = 'popup-navigation-button'

/**
 * タッチにも対応している
 */
const useIsLongClicking = (onMouseClick: () => void) => {
  const isLongClicking = ref(false)
  let timer = 0

  const onMouseTouchStart = () => {
    timer = window.setTimeout(() => {
      isLongClicking.value = true
    }, 100)
  }
  const onMouseTouchEnd = (e: MouseEvent | TouchEvent) => {
    window.clearTimeout(timer)

    const point = 'changedTouches' in e ? e.changedTouches[0] : e
    const target = document.elementFromPoint(point.clientX, point.clientY)
    if (
      target === null ||
      target.closest(`#${popupNavigatorButtonId}`) === null
    ) {
      isLongClicking.value = false
      return
    }

    if (!isLongClicking.value) {
      onMouseClick()
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
    isLongClicking.value = false
  }
  return { isLongClicking, onMouseTouchStart, onMouseTouchEnd }
}

const useNavigator = () => {
  const router = useRouter()
  const movePrev = () => {
    router.back()
  }
  const moveNext = () => {
    router.forward()
  }
  return { movePrev, moveNext }
}

export default defineComponent({
  name: 'PopupNavigator',
  components: {
    Icon
  },
  setup(props, { emit }) {
    const { isMobile } = useIsMobile()
    const {
      isLongClicking,
      onMouseTouchStart,
      onMouseTouchEnd
    } = useIsLongClicking(() => {
      emit('clickIcon')
    })
    const { movePrev, moveNext } = useNavigator()
    return {
      popupNavigatorButtonId,
      isLongClicking,
      onMouseTouchStart,
      onMouseTouchEnd,
      movePrev,
      moveNext,
      isMobile
    }
  }
})
</script>

<style lang="scss" module>
.navigationButton {
  @include color-ui-primary;
  position: relative;
  display: flex;
  height: 36px;
  width: 36px;
  justify-content: center;
  align-items: center;
  margin-right: 8px;
}
.popupNavigator {
  @include background-primary;
  @include drop-shadow-default;
  position: absolute;
  top: -8px;
  left: -8px;
  border-radius: 4px;
  user-select: none;
  white-space: nowrap;
  z-index: $z-index-header-popup-navigator;
}
.popupNavigatorItem {
  padding: 12px 20px;
  &:hover {
    @include background-secondary;
  }
}
.icon {
  vertical-align: middle;
}
</style>
