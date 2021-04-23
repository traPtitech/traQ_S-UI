<template>
  <header :class="$style.container">
    <div :class="$style.headerContainer">
      <button
        v-if="isMobile"
        :class="$style.navigationButton"
        @pointerdown="onPointerDown"
        @touchstart.stop
        @pointerup="onPointerUpOrLeave"
        @pointerleave="onPointerUpOrLeave"
      >
        <icon name="traQ" :size="28" />
        <div v-show="isLongClicking" :class="$style.popupNavigator">
          <div :class="$style.popupNavigatorItem" @pointerup="movePrev">
            <icon name="arrow-left" mdi :class="$style.icon" />
            戻る
          </div>
          <div :class="$style.popupNavigatorItem" @pointerup="moveNext">
            <icon name="arrow-right" mdi :class="$style.icon" />
            進む
          </div>
        </div>
      </button>
      <h2 :class="$style.headerBody">
        <slot name="header" />
      </h2>
    </div>
    <slot :class="$style.tools" name="tools" />
  </header>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import Icon from '@/components/UI/Icon.vue'
import useIsMobile from '@/use/isMobile'
import useNavigationController from '@/use/navigationController'
import { useRouter } from 'vue-router'

/**
 * タッチにも対応している
 */
const useIsLongClicking = (onMouseClick: () => void) => {
  const isLongClicking = ref(false)
  let timer = 0

  const onPointerDown = (e: PointerEvent) => {
    timer = window.setTimeout(() => {
      isLongClicking.value = true
    }, 100)
  }
  const onPointerUpOrLeave = (e: PointerEvent) => {
    window.clearTimeout(timer)
    if (!isLongClicking.value && e.type === 'pointerup') {
      onMouseClick()
    }
    isLongClicking.value = false
  }
  return { isLongClicking, onPointerDown, onPointerUpOrLeave }
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
  name: 'MainViewHeader',
  components: {
    Icon
  },
  setup() {
    const { isMobile } = useIsMobile()
    const { openNav } = useNavigationController()
    const {
      isLongClicking,
      onPointerDown,
      onPointerUpOrLeave
    } = useIsLongClicking(openNav)
    const { movePrev, moveNext } = useNavigator()
    return {
      isLongClicking,
      onPointerDown,
      onPointerUpOrLeave,
      movePrev,
      moveNext,
      isMobile,
      openNav
    }
  }
})
</script>

<style lang="scss" module>
$headerHeight: 80px;

.container {
  @include background-primary;
  @include color-ui-primary;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: $headerHeight;
  width: 100%;
  flex: 0 0 $headerHeight;
  padding: 16px;
  border-bottom: 2px solid $theme-ui-tertiary;
  contain: layout;
}
.headerBody {
  width: 100%;
  min-width: 0;
}
.headerContainer {
  display: flex;
  min-width: 0;
}
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
.tools {
  flex-shrink: 0;
}
</style>
