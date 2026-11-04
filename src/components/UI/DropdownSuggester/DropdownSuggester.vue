<template>
  <teleport to="#dropdown-suggester-popup" :disabled="!props.teleport">
    <div
      v-if="isShown"
      :id="popupId"
      :class="$style.container"
      :style="styledPosition"
      :data-placement="placement"
      role="grid"
      aria-label="入力候補"
    >
      <!-- 入力欄にフォーカスを残し、タッチ操作でスクロールできるようクリック時だけ確定する。 -->
      <div ref="scrollContainer" :class="$style.scroll">
        <div
          v-for="(candidate, index) in candidates"
          :id="candidateRowId(popupId, candidate.word)"
          :key="candidateKey(candidate.word)"
          role="row"
          :aria-selected="selectedIndex === index"
          :class="$style.row"
        >
          <DropdownSuggesterCandidate
            role="gridcell"
            :tabindex="-1"
            :candidate="candidate.word"
            :display="candidate.display"
            :is-selected="selectedIndex === index"
            @mousedown.prevent
            @click="select(candidate.word)"
          />

          <div
            v-if="candidate.canContinuePath"
            role="gridcell"
            :class="$style.pathCell"
          >
            <button
              :tabindex="-1"
              type="button"
              :class="$style.continuePath"
              :aria-label="`${candidate.word.text} の子チャンネルを補完`"
              title="子チャンネルを補完"
              @mousedown.prevent
              @click="emit('continuePath', candidate.word)"
            >
              /...
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="showKeyboardHints"
        :class="$style.hint"
        role="group"
        aria-label="補完のキーボード操作"
      >
        <span v-for="shortcut in shortcuts" :key="shortcut.keys.join()">
          <template v-for="(key, index) in shortcut.keys" :key="key">
            <span v-if="index" :class="$style.hintDelimiter">
              <span>·</span>
            </span>

            <kbd>{{ key }}</kbd>
          </template>
          {{ shortcut.description }}
        </span>
      </div>
    </div>
  </teleport>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'

import { useEventListener } from '@vueuse/core'

import { isIOS } from '/@/lib/dom/browser'
import {
  candidateKey,
  candidateRowId
} from '/@/lib/suggestion/candidatePresentation'
import type {
  Candidate,
  SuggestionShortcut,
  Word
} from '/@/lib/suggestion/types'

import DropdownSuggesterCandidate from './DropdownSuggesterCandidate.vue'

const props = withDefaults(
  defineProps<{
    popupId: string
    isShown?: boolean
    width: number
    position?: { top: number; left: number }
    candidates?: Candidate[]
    shortcuts: SuggestionShortcut[]
    showKeyboardHints: boolean
    selectedIndex: number
    placement?: 'above' | 'below'
    teleport?: boolean
  }>(),
  {
    isShown: false,
    position: () => ({ top: 0, left: 0 }),
    candidates: () => [],
    placement: 'above',
    teleport: true
  }
)

const emit = defineEmits<{
  (e: 'select', _word: Word): void
  (e: 'continuePath', _word: Word): void
}>()

const MARGIN = 8

const iOSFlag = isIOS()

const viewportOffset = ref(window.visualViewport?.offsetTop ?? 0)

useEventListener(window.visualViewport, ['resize', 'scroll'], () => {
  viewportOffset.value = window.visualViewport?.offsetTop ?? 0
})

const styledPosition = computed(() => ({
  top: `${
    iOSFlag ? viewportOffset.value + props.position.top : props.position.top
  }px`,
  left: `max(${MARGIN}px, min(${props.position.left}px, calc(100vw - ${props.width + MARGIN}px)))`,
  width: `min(${props.width}px, calc(100vw - ${2 * MARGIN}px))`
}))

const select = (word: Word) => {
  emit('select', word)
}

const scrollContainer = ref<HTMLDivElement | null>(null)

// 位置更新だけの再描画では、ホイールやタッチで動かしたスクロール位置を保つ。
watch(
  [scrollContainer, () => props.selectedIndex, () => props.candidates],
  () => {
    scrollContainer.value
      ?.querySelector<HTMLElement>('[aria-selected="true"]')
      ?.scrollIntoView({ block: 'center' })
  },
  { flush: 'post' }
)
</script>

<style lang="scss" module>
.container {
  @include color-ui-secondary;
  @include background-primary;
  position: fixed;
  transform: translateY(-100%);

  &[data-placement='below'] {
    transform: none;
  }

  border: solid 2px $theme-background-secondary-border;
  border-radius: 4px;
  filter: $common-drop-shadow-default;
  z-index: $z-index-word-suggester;
}

.scroll {
  overflow-y: scroll;
  max-height: 32px * 4.5;
}

.row {
  display: flex;
  width: 100%;
  min-height: 32px;
}

.hint {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 16px;
  padding: 4px 8px;
  font-size: 0.75rem;
  border-top: 1px solid $theme-background-secondary-border;

  kbd {
    @include color-ui-primary;
    display: inline-block;
    min-width: 1.5em;
    padding: 0 4px;
    border: 1px solid $theme-background-secondary-border;
    border-bottom-width: 2px;
    border-radius: 3px;
    background: color-mix(
      in srgb,
      $theme-ui-primary-default 12%,
      $theme-background-primary-default
    );
    font-family: inherit;
    font-size: inherit;
    font-weight: 600;
    line-height: 1.4;
    text-align: center;
  }
}

.hintDelimiter {
  margin-inline: 1px;
}

.pathCell {
  display: flex;
  margin-left: auto;
}

.continuePath {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-weight: 550;
  letter-spacing: 0.1rem;
  margin-left: auto;
  padding: 2px 14px;
  text-align: center;
  white-space: nowrap;
  border-left: 1px solid $theme-background-secondary-border;
  color: $theme-accent-primary-default;
  background: color-mix(in srgb, $theme-accent-primary-default 4%, transparent);
  cursor: pointer;

  &:hover,
  &:focus-visible {
    background: color-mix(
      in srgb,
      $theme-accent-primary-default 10%,
      transparent
    );
  }
}

@media (pointer: coarse) {
  .row {
    min-height: 44px;
  }

  .scroll {
    max-height: 44px * 4.5;
  }
}
</style>
