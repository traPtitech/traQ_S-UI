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
import { computed, nextTick, proxyRefs, useId, watch, watchEffect } from 'vue'

import { EditorContent, useEditor } from '@tiptap/vue-3'
import { useResizeObserver } from '@vueuse/core'

import DropdownSuggester from '/@/components/UI/DropdownSuggester/DropdownSuggester.vue'
import useRecentKeyboardInput from '/@/composables/dom/useRecentKeyboardInput'
import useInputComposition from '/@/composables/referenceInput/useInputComposition'
import useReferenceLabels from '/@/composables/referenceInput/useReferenceLabels'
import useReferenceSuggestions from '/@/composables/referenceInput/useReferenceSuggestions'
import useChannelPath from '/@/composables/useChannelPath'
import { embeddingOrigin } from '/@/lib/apis'
import { isIOS } from '/@/lib/dom/browser'
import {
  type PreparePaste,
  inputDataTransfer
} from '/@/lib/referenceInput/dataTransfer'
import {
  type ReferenceInputHandle,
  contentToParts,
  inputExtensions
} from '/@/lib/referenceInput/editor'
import {
  loadInputDocument,
  partsToInlineContent,
  replaceInputDocument,
  sourceToContent
} from '/@/lib/referenceInput/editorDocument'
import {
  type InputLifecycle,
  inputLifecycleKey
} from '/@/lib/referenceInput/inputLifecycle'
import {
  type MarkdownLineBreakOptions,
  markdownLineBreak
} from '/@/lib/referenceInput/markdownLineBreak'
import { markdownPreviewKey } from '/@/lib/referenceInput/markdownPreview'
import { syncInputSelection } from '/@/lib/referenceInput/selection'
import {
  type InputMode,
  type InputPart,
  serializeInput
} from '/@/lib/references'
import {
  candidateLabel,
  candidateRowId
} from '/@/lib/suggestion/candidatePresentation'

const popupId = useId()
const model = defineModel<string>({ default: '' })

const keyboardRecentlyUsed = useRecentKeyboardInput()

const props = withDefaults(
  defineProps<{
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

const { label } = useReferenceLabels()
const { channelPathStringToId } = useChannelPath()

const updateInputLifecycle = (options: Partial<InputLifecycle>) => {
  const current = editor.value
  if (!current || current.isDestroyed) return
  const previous = inputLifecycleKey.getState(current.state)

  if (
    Object.entries(options).every(
      ([key, value]) => previous?.[key as keyof InputLifecycle] === value
    )
  )
    return

  current.view.dispatch(current.state.tr.setMeta(inputLifecycleKey, options))
  nextTick(() => emit('layoutChange'))
}

const {
  isComposing,
  isCompositionKeyEvent,
  finish: finishComposition,
  start: startComposition,
  end: endComposition
} = useInputComposition({
  view: () => editor.value?.view,
  onChange: composing => updateInputLifecycle({ composing }),
  onSettled: () =>
    nextTick(() => {
      updateTarget()
      syncEditorAttributes()
    })
})

const insertParts = (
  parts: InputPart[],
  range?: { from: number; to: number },
  focus = true
) => {
  const current = editor.value

  if (!current || props.readonly) return

  const content = partsToInlineContent(parts)
  const chain = current.chain()
  if (focus) chain.focus()

  chain
    .insertContentAt(range ?? current.state.selection, content, {
      parseOptions: { preserveWhitespace: 'full' }
    })
    .run()
}

const insertTextAt = (
  text: string,
  range?: { from: number; to: number },
  focus?: boolean
) =>
  insertParts(
    [
      {
        type: 'text',
        text: props.mode === 'search' ? text.replace(/[\r\n]+/g, ' ') : text
      }
    ],
    range,
    focus
  )

const insertText: ReferenceInputHandle['insertText'] = (text, { focus } = {}) =>
  insertTextAt(text, undefined, focus)

const insertLineBreak = (options: MarkdownLineBreakOptions = {}) => {
  const current = editor.value

  if (!current || props.readonly || props.mode !== 'message' || isComposing())
    return

  if (!props.markdown) {
    insertText('\n')

    return
  }

  current.view.dispatch(markdownLineBreak(current.state, options))
  current.view.focus()
}

const {
  shown,
  candidates,
  shortcuts,
  selectedIndex,
  position,
  update: updateTarget,
  updatePosition,
  hide: hideSuggestions,
  confirmCandidate: selectCandidate,
  continuePath: continueChannelPath,
  appendEffect: appendStampEffect,
  onKeyDown: onSuggestionKeyDown
} = useReferenceSuggestions({
  editor: () => editor.value,
  mode: () => props.mode,
  isComposing,
  finishComposition,
  insertParts
})

const announcement = computed(() => {
  const candidate = candidates.value[selectedIndex.value]

  return shown.value && candidate
    ? `${candidateLabel(candidate.word, candidate.display)}、${selectedIndex.value + 1} / ${candidates.value.length}`
    : ''
})

const handleKeyAction = (event: KeyboardEvent) => {
  if (onSuggestionKeyDown(event)) return true

  emit('keydown', event)

  return event.defaultPrevented
}

const iOSFlag = isIOS()
let pendingIOSEnter: KeyboardEvent | undefined

const editorAttributes = computed(() => {
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
          'aria-expanded': String(shown.value && candidates.value.length > 0)
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
})

const editor = useEditor({
  extensions: inputExtensions({ label, mode: props.mode, isComposing }),

  content: sourceToContent(model.value, props.mode),

  editable: !props.readonly,
  enableCoreExtensions: { keymap: false },
  enableInputRules: false,
  enablePasteRules: false,

  editorProps: {
    attributes: ({ doc }) => ({
      ...editorAttributes.value,
      'data-is-empty': String(doc.firstChild?.childCount === 0)
    }),

    handleKeyDown: (_view, event) => {
      if (isCompositionKeyEvent(event)) return false

      if (handleKeyAction(event)) return true

      if (event.key === 'Enter') {
        insertLineBreak({
          continueItem:
            event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey
        })

        return true
      }

      return false
    },

    handleDOMEvents: {
      keydown: (_view, event) => {
        pendingIOSEnter = undefined

        // IME の既定動作は許可し、ProseMirror の通常のキー処理だけを止める。
        if (isCompositionKeyEvent(event)) return true

        if (
          iOSFlag &&
          event.key === 'Enter' &&
          !event.ctrlKey &&
          !event.altKey &&
          !event.metaKey
        ) {
          // iOS の既定動作を許可し、Enter は続く beforeinput で一度だけ処理する。
          // ProseMirror の遅延 Enter 処理は登録させない。
          pendingIOSEnter = event

          return true
        }

        return false
      },

      compositionstart: () => {
        pendingIOSEnter = undefined
        startComposition()
        hideSuggestions()

        return false
      },

      compositionend: () => {
        endComposition()

        return false
      },

      keyup: (_view, event) => {
        pendingIOSEnter = undefined
        emit('keyup', event)

        return false
      },

      beforeinput: (view, event) => {
        const enter = pendingIOSEnter
        pendingIOSEnter = undefined

        if (isComposing() || event.isComposing || !event.cancelable)
          return false

        emit('beforeInput', event)

        if (event.defaultPrevented) return true

        if (
          event.inputType === 'insertParagraph' ||
          event.inputType === 'insertLineBreak'
        ) {
          event.preventDefault()

          syncInputSelection(view)

          if (enter && handleKeyAction(enter)) return true

          insertLineBreak({
            continueItem: event.inputType === 'insertLineBreak'
          })

          return true
        }

        return false
      },

      ...inputDataTransfer({
        editor: () => editor.value,
        readonly: () => props.readonly,
        mode: () => props.mode,
        label,
        channelLinkOrigins: () => [location.origin, embeddingOrigin],
        channelPathToId: channelPathStringToId,
        insertParts,
        insertText: insertTextAt,
        preparePaste: event => props.preparePaste?.(event)
      })
    }
  },

  onUpdate: ({ editor: current }) => {
    model.value = serializeInput(contentToParts(current.state.doc))

    nextTick(() => {
      updateTarget()
      emit('layoutChange')
    })
  },

  onSelectionUpdate: updateTarget,

  onFocus: () => {
    updateInputLifecycle({ focused: true })
    emit('focus')
  },

  onBlur: () => {
    pendingIOSEnter = undefined
    updateInputLifecycle({ focused: false })
    hideSuggestions()
    emit('blur')
  }
})

watch(
  () => [editor.value, props.markdown] as const,
  () =>
    updateInputLifecycle({
      markdown: props.mode === 'message' && props.markdown
    })
)

const syncEditorAttributes = () => {
  const current = editor.value
  if (current && !current.isDestroyed && !isComposing()) current.setOptions({})
}

watch([editor, editorAttributes], syncEditorAttributes)

watch([model, () => props.documentKey], ([value, key], [, previousKey]) => {
  const current = editor.value
  if (!current) return

  const changed =
    key === undefined || key !== previousKey
      ? loadInputDocument(current, value, props.mode, key !== previousKey)
      : replaceInputDocument(current, value, props.mode)

  if (!changed) return

  hideSuggestions()
  emit('layoutChange')
})

watch(
  () => props.readonly,
  value => editor.value?.setEditable(!value, false)
)

watchEffect(() => {
  const current = editor.value

  if (!current) return

  const labels = contentToParts(current.state.doc)
    .filter(p => p.type === 'reference')
    .map(p => label(p.reference))

  const serialized = JSON.stringify(labels)
  if (markdownPreviewKey.getState(current.state)?.labels === serialized) return

  current.view.dispatch(
    current.state.tr.setMeta(markdownPreviewKey, { labels: serialized })
  )
})

const focus: ReferenceInputHandle['focus'] = position =>
  editor.value?.commands.focus(position)
const element = computed(() => editor.value?.view.dom)

useResizeObserver(element, () => {
  updatePosition()
  emit('layoutChange')
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
