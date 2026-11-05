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
import { computed, nextTick, useId, watch, watchEffect } from 'vue'

import { EditorContent, useEditor } from '@tiptap/vue-3'
import { useResizeObserver } from '@vueuse/core'

import DropdownSuggester from '/@/components/UI/DropdownSuggester/DropdownSuggester.vue'
import useRecentKeyboardInput from '/@/composables/dom/useRecentKeyboardInput'
import useInputComposition from '/@/composables/referenceInput/useInputComposition'
import useReferenceLabels from '/@/composables/referenceInput/useReferenceLabels'
import useReferenceSuggestions from '/@/composables/referenceInput/useReferenceSuggestions'
import useChannelPath from '/@/composables/useChannelPath'
import { isIOS } from '/@/lib/dom/browser'
import { normalizeMessageParts } from '/@/lib/message/content'
import {
  type PreparePaste,
  inputDataTransfer
} from '/@/lib/referenceInput/dataTransfer'
import {
  type ReferenceInputHandle,
  contentToParts,
  inputExtensions,
  partsToContent
} from '/@/lib/referenceInput/editor'
import {
  loadInputDocument,
  replaceInputDocument
} from '/@/lib/referenceInput/editorDocument'
import { currentInputSelection } from '/@/lib/referenceInput/selection'
import {
  type InputMode,
  type InputPart,
  parseInput,
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
    preparePaste?: PreparePaste
    documentKey?: string | number
    testId?: string
  }>(),
  {
    mode: 'message',
    placeholder: '',
    labelledBy: undefined,
    readonly: false,
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

const {
  isComposing,
  composingEvent,
  finish: finishComposition,
  start: startComposition,
  end: endComposition
} = useInputComposition({
  view: () => editor.value?.view,
  onSettled: () => nextTick(updateTarget)
})

const insertParts = (
  parts: InputPart[],
  range?: { from: number; to: number },
  focus = true
) => {
  const current = editor.value

  if (!current || props.readonly) return

  const content = partsToContent(parts).content?.[0]?.content ?? []
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

const insertLineBreak = () => {
  if (props.readonly || props.mode !== 'message' || isComposing()) return
  insertText('\n')
}

const {
  shown,
  candidates,
  shortcuts,
  selectedIndex,
  position,
  update: updateTarget,
  hide: hideSuggestions,
  select: selectCandidate,
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

const editor = useEditor({
  extensions: inputExtensions({ label, mode: props.mode, isComposing }),

  content: partsToContent(
    props.mode === 'message'
      ? normalizeMessageParts(parseInput(model.value, props.mode))
      : parseInput(model.value, props.mode)
  ),

  editable: !props.readonly,
  enableCoreExtensions: { keymap: false },
  enableInputRules: false,
  enablePasteRules: false,

  editorProps: {
    attributes: ({ doc }) => {
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
        'data-is-empty': String(doc.firstChild?.childCount === 0),
        ...(props.testId ? { 'data-testid': props.testId } : {})
      }
    },

    handleKeyDown: (_view, event) => {
      if (composingEvent(event)) return false

      if (handleKeyAction(event)) return true

      if (event.key === 'Enter') {
        insertLineBreak()

        return true
      }

      return false
    },

    handleDOMEvents: {
      keydown: (_view, event) => {
        pendingIOSEnter = undefined

        // IME の既定動作は許可し、ProseMirror の通常のキー処理だけを止める。
        if (composingEvent(event)) return true

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

          const selection = currentInputSelection(view)
          if (!selection.eq(view.state.selection))
            view.dispatch(view.state.tr.setSelection(selection))

          if (enter && handleKeyAction(enter)) return true

          insertLineBreak()

          return true
        }

        return false
      },

      ...inputDataTransfer({
        editor: () => editor.value,
        readonly: () => props.readonly,
        mode: () => props.mode,
        label,
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
    emit('focus')
  },

  onBlur: () => {
    pendingIOSEnter = undefined
    hideSuggestions()
    emit('blur')
  }
})

watchEffect(() => {
  const current = editor.value
  if (!current || current.isDestroyed) return
  const selected = candidates.value[selectedIndex.value]
  const expanded = shown.value && candidates.value.length > 0

  const attributes = {
    'aria-controls': expanded ? popupId : undefined,
    'aria-expanded': props.mode === 'search' ? String(expanded) : undefined,
    'aria-activedescendant':
      expanded && selected ? candidateRowId(popupId, selected.word) : undefined
  }

  for (const [name, value] of Object.entries(attributes)) {
    if (value === undefined) current.view.dom.removeAttribute(name)
    else current.view.dom.setAttribute(name, value)
  }
})

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

const focus: ReferenceInputHandle['focus'] = position =>
  editor.value?.commands.focus(position)
const element = computed(() => editor.value?.view.dom)

useResizeObserver(element, () => emit('layoutChange'))

defineExpose({ focus, insertText, insertLineBreak, element })
</script>

<style lang="scss" module>
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
  opacity: 0.5;
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

.srOnly {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}
</style>
