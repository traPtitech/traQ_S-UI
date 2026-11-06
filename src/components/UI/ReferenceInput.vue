<template>
  <div
    :class="$style.container"
    :data-readonly="readonly"
    @mousedown.left.self.prevent="focus()"
  >
    <EditorContent :editor="editor" :class="$style.content" />

    <!-- 検索候補をパレット内に配置し、重なり順と外側クリックの判定範囲をそろえる。 -->
    <DropdownSuggester
      :popup-id="popupId"
      :is-shown="shown && candidates.length > 0"
      :width="380"
      :position="position"
      :placement="mode === 'search' ? 'below' : 'above'"
      :teleport="mode !== 'search'"
      :candidates="candidates"
      :shortcuts="shortcuts"
      :show-keyboard-hints="keyboardRecentlyUsed"
      :selected-index="selectedIndex"
      @select="selectCandidate"
      @continue-path="continueChannelPath"
      @append-effect="appendStampEffect"
    />

    <span :class="$style.srOnly" aria-live="polite">
      {{ announcement }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed, proxyRefs, useId } from 'vue'

import { EditorContent } from '@tiptap/vue-3'

import DropdownSuggester from '/@/components/UI/DropdownSuggester/DropdownSuggester.vue'
import useRecentKeyboardInput from '/@/composables/dom/useRecentKeyboardInput'
import useReferenceEditor from '/@/composables/referenceInput/useReferenceEditor'
import type { PreparePaste } from '/@/lib/referenceInput/dataTransfer'
import type { ReferenceInputHandle } from '/@/lib/referenceInput/editor'
import type { InputMode } from '/@/lib/references'
import {
  candidateLabel,
  candidateRowId
} from '/@/lib/suggestion/candidatePresentation'

const popupId = useId()
const model = defineModel<string>({ default: '' })

const keyboardRecentlyUsed = useRecentKeyboardInput()

const props = withDefaults(
  defineProps<{
    /** Mount 中は変更しない。 */
    mode?: InputMode
    placeholder?: string
    labelledBy?: string
    readonly?: boolean
    markdown?: boolean
    preparePaste?: PreparePaste
    documentKey?: string | number
    testId?: string
  }>(),
  {
    mode: 'message',
    placeholder: '',
    labelledBy: undefined,
    readonly: false,
    markdown: false,
    preparePaste: undefined,
    documentKey: undefined,
    testId: undefined
  }
)

const emit = defineEmits<{
  keydown: [event: KeyboardEvent]
  keyup: [event: KeyboardEvent]
  beforeInput: [event: InputEvent]
  focus: []
  blur: []
  layoutChange: []
}>()

const { editor, suggestions, focus, insertText, insertLineBreak, element } =
  useReferenceEditor({
    model,
    props,
    attributes: ({ shown, candidates, selectedIndex }) => {
      const candidate = candidates.value[selectedIndex.value]

      return {
        role: props.mode === 'search' ? 'combobox' : 'textbox',
        tabindex: '0',
        'aria-autocomplete': 'list',
        'aria-haspopup': 'grid',
        ...(shown.value && candidates.value.length
          ? { 'aria-controls': popupId }
          : {}),
        ...(props.mode === 'search'
          ? {
              'aria-expanded': String(
                shown.value && candidates.value.length > 0
              )
            }
          : {}),
        ...(shown.value && candidate
          ? {
              'aria-activedescendant': candidateRowId(popupId, candidate.word)
            }
          : {}),
        dir: 'auto',
        ...(props.labelledBy
          ? { 'aria-labelledby': props.labelledBy }
          : { 'aria-label': props.placeholder }),
        'aria-readonly': String(props.readonly),
        'aria-multiline': String(props.mode === 'message'),
        'data-placeholder': props.placeholder,
        ...(props.testId ? { 'data-testid': props.testId } : {})
      }
    },
    onKeyDown: event => emit('keydown', event),
    onKeyUp: event => emit('keyup', event),
    onBeforeInput: event => emit('beforeInput', event),
    onFocus: () => emit('focus'),
    onBlur: () => emit('blur'),
    onLayoutChange: () => emit('layoutChange')
  })

const {
  shown,
  candidates,
  shortcuts,
  selectedIndex,
  position,
  confirmCandidate: selectCandidate,
  continuePath: continueChannelPath,
  appendEffect: appendStampEffect
} = suggestions

const announcement = computed(() => {
  const candidate = candidates.value[selectedIndex.value]

  return shown.value && candidate
    ? `${candidateLabel(candidate.word, candidate.display)}、${selectedIndex.value + 1} / ${candidates.value.length}`
    : ''
})

defineExpose(
  proxyRefs({
    focus,
    insertText,
    insertLineBreak,
    element
  }) satisfies ReferenceInputHandle
)
</script>

<style lang="scss" module>
$spoiler-background: color-mix(
  in srgb,
  $theme-text-primary-default 10%,
  transparent
);

.container {
  min-width: 0;
  overflow-y: auto;
  cursor: text;
}

.content :global(.tiptap) {
  outline: none;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  min-height: 1.5em;
}

.content :global(p) {
  margin: 0;
  white-space: pre-wrap;
  // textarea と同じく、改行ごとに文字の方向を判定する。
  unicode-bidi: plaintext;
}

.content :global(.tiptap[data-is-empty='true'])::before {
  content: attr(data-placeholder);
  position: absolute;
  color: var(--input-placeholder-color, inherit);
  opacity: var(--input-placeholder-opacity, 0.5);
  pointer-events: none;
}

.content :global(.reference-token) {
  // 長い参照全体が次の行へ送られ、先頭に空行ができるのを防ぐ。
  word-break: break-all;
  color: $theme-accent-primary-default;
  background: $theme-background-secondary-default;
  font-weight: bold;
  border-radius: 3px;
  padding: 0 2px;
  box-decoration-break: clone;
}

.content :global(.ProseMirror-selectednode) {
  outline: 2px solid $theme-accent-focus-default;
}

.content :global(.ProseMirror-hideselection *::selection) {
  // 選択背景を隠すときは、文字色も通常の表示にそろえる。
  color: currentColor;
}

.content :global(.markdown-input-source) {
  color: $theme-ui-secondary-default;
}

.content :global(.markdown-input-syntax) {
  opacity: 0.5;
}

.content :global(.markdown-input-strong) {
  font-weight: bold;
}

.content :global(.markdown-input-emphasis) {
  font-style: italic;
}

.content :global(.markdown-input-strike) {
  text-decoration: line-through;
}

.content :global(.markdown-input-highlight) {
  color: var(--markdown-mark-text);
  background: var(--markdown-mark-background);
  border-radius: 2px;
}

.content :global(.markdown-input-spoiler) {
  border-radius: 3px;
  background: $spoiler-background;
}

.content :global(.markdown-input-rendered img) {
  max-width: 100%;
  max-height: 240px;
  vertical-align: middle;
  border-radius: 4px;
}

.content :global(.markdown-input-link) {
  color: $theme-accent-primary-default;
  text-decoration: underline;
}

.content :global(.markdown-input-code),
.content :global(.markdown-input-code-block) {
  font-family: monospace;
  background: var(--markdown-code-background);
  border-radius: 3px;
  box-decoration-break: clone;
}

.content :global(.markdown-input-code) {
  padding: 0 0.2em;
}

.content :global(.markdown-input-code.markdown-input-spoiler) {
  background:
    linear-gradient($spoiler-background, $spoiler-background),
    var(--markdown-code-background);
}

.content :global(.markdown-input-code-block) {
  padding: 0.15em 0.4em;
}

.content :global(.markdown-input-quote) {
  color: $theme-ui-secondary-default;
}

.content :global(.markdown-input-container-guide) {
  display: inline-flex;
  height: 1em;
  vertical-align: -0.15em;
  user-select: none;
}

.content :global(.markdown-input-quote-bar) {
  border-left: 3px solid $theme-background-secondary-border;
  margin-right: 0.4em;
}

.content :global(.markdown-input-h1),
.content :global(.markdown-input-h2),
.content :global(.markdown-input-h3),
.content :global(.markdown-input-h4),
.content :global(.markdown-input-h5),
.content :global(.markdown-input-h6) {
  font-weight: bold;
  line-height: 1.5;
}

.content :global(.markdown-input-h1) {
  font-size: 1.8em;
}

.content :global(.markdown-input-h2) {
  font-size: 1.5em;
}

.content :global(.markdown-input-h3) {
  font-size: 1.25em;
}

.content :global(.markdown-input-bullet) {
  color: $theme-ui-secondary-default;
}

.content :global(.markdown-input-rule) {
  display: inline-block;
  width: 100%;
  border-bottom: 1px solid $theme-background-secondary-border;
  vertical-align: middle;
}

.content :global(.markdown-input-hidden) {
  // display:none にすると IME が末尾の記号を飛ばして変換範囲を作ってしまう。
  font-size: 0;
  line-height: 0;
  white-space: normal;
  padding: 0;
  border: 0;
}

.srOnly {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}
</style>
