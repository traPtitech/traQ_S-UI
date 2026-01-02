<template>
  <teleport to="#dropdown-suggester-popup">
    <div v-if="isShown" :class="$style.container" :style="styledPosition">
      <!--
        mousedownイベントでやっているのはclickイベントだとフォーカスが外れるため
        preventをすることでclickイベントでフォーカスが外れるのを回避している
      -->
      <div :class="$style.scroll">
        <div
          v-for="(candidate, index) in candidates"
          :key="candidate.word.text"
          :ref="selectedIndex === index ? scrollToSelectedCandidate : undefined"
        >
          <DropdownSuggesterCandidate
            :candidate="candidate.word"
            :display="candidate.display"
            :is-selected="selectedIndex === index"
            @mousedown.prevent="select(candidate.word)"
          />
        </div>
      </div>
    </div>
  </teleport>
</template>

<script lang="ts" setup>
import { type ComponentPublicInstance, computed } from 'vue'

import { isIOS } from '/@/lib/dom/browser'
import type { Candidate, Word } from '/@/lib/suggestion/basic'

import DropdownSuggesterCandidate from './DropdownSuggesterCandidate.vue'

const props = withDefaults(
  defineProps<{
    isShown?: boolean
    width: number
    position?: { top: number; left: number }
    candidates?: Candidate[]
    selectedIndex: number | null
  }>(),
  {
    isShown: false,
    position: () => ({ top: 0, left: 0 }),
    candidates: () => []
  }
)

const emit = defineEmits<{
  (e: 'select', _word: Word): void
}>()

const MARGIN = 8

const iOSFlag = isIOS()

const styledPosition = computed(() => ({
  top: `${
    iOSFlag
      ? (window.visualViewport?.offsetTop ?? 0) + props.position.top
      : props.position.top
  }px`,
  left: `min(${props.position.left}px, calc(100vw - ${props.width + MARGIN}px))`,
  width: `${props.width}px`
}))

const select = (word: Word) => {
  emit('select', word)
}

const scrollToSelectedCandidate = (
  element: Element | ComponentPublicInstance | null
) => {
  if (!(element instanceof HTMLDivElement)) return
  element.scrollIntoView({
    block: 'center'
  })
}
</script>

<style lang="scss" module>
.container {
  @include color-ui-secondary;
  @include background-primary;
  position: fixed;
  transform: translateY(-100%);
  border: solid 2px $theme-background-secondary-border;
  border-radius: 4px;
  filter: $common-drop-shadow-default;
  z-index: $z-index-word-suggester;
}
.scroll {
  overflow-y: scroll;
  max-height: 32px * 4.5;
}
</style>
