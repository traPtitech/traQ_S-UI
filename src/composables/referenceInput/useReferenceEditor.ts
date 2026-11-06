import { type Ref, computed, nextTick, watch } from 'vue'

import { useEditor } from '@tiptap/vue-3'
import { useResizeObserver } from '@vueuse/core'

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
import { createInputEventHandlers } from '/@/lib/referenceInput/inputEvents'
import {
  type InputRuntimeState,
  inputLifecycleKey
} from '/@/lib/referenceInput/inputLifecycle'
import {
  type MarkdownLineBreakOptions,
  markdownLineBreak
} from '/@/lib/referenceInput/markdownLineBreak'
import {
  type InputMode,
  type InputPart,
  serializeInput
} from '/@/lib/references'

import useMarkdownReferenceLabels from './useMarkdownReferenceLabels'

type SuggestionPresentation = Pick<
  ReturnType<typeof useReferenceSuggestions>,
  'shown' | 'candidates' | 'selectedIndex'
>

interface ReferenceEditorOptions {
  model: Ref<string>
  props: {
    mode: InputMode
    readonly: boolean
    markdown: boolean
    documentKey?: string | number
    preparePaste?: PreparePaste
  }
  attributes: (suggestions: SuggestionPresentation) => Record<string, string>
  onKeyDown: (event: KeyboardEvent) => void
  onKeyUp: (event: KeyboardEvent) => void
  onBeforeInput: (event: InputEvent) => void
  onFocus: () => void
  onBlur: () => void
  onLayoutChange: () => void
}

export default function useReferenceEditor(options: ReferenceEditorOptions) {
  const { model, props } = options

  const { label } = useReferenceLabels()
  const { channelPathStringToId } = useChannelPath()

  const updateInputRuntimeState = (runtime: Partial<InputRuntimeState>) => {
    const current = editor.value
    if (!current || current.isDestroyed) return
    const previous = inputLifecycleKey.getState(current.state)

    if (
      Object.entries(runtime).every(
        ([key, value]) => previous?.[key as keyof InputRuntimeState] === value
      )
    )
      return

    current.view.dispatch(current.state.tr.setMeta(inputLifecycleKey, runtime))
    nextTick(() => options.onLayoutChange())
  }

  const {
    isComposing,
    isCompositionKeyEvent,
    finish: finishComposition,
    start: startComposition,
    end: endComposition
  } = useInputComposition({
    view: () => editor.value?.view,
    onChange: composing => updateInputRuntimeState({ composing }),
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

  const insertText: ReferenceInputHandle['insertText'] = (
    text,
    { focus } = {}
  ) => insertTextAt(text, undefined, focus)

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

  const suggestions = useReferenceSuggestions({
    editor: () => editor.value,
    mode: () => props.mode,
    isComposing,
    finishComposition,
    insertParts
  })

  const {
    update: updateTarget,
    updatePosition,
    hide: hideSuggestions,
    onKeyDown: onSuggestionKeyDown
  } = suggestions

  const handleKeyAction = (event: KeyboardEvent) => {
    if (onSuggestionKeyDown(event)) return true

    options.onKeyDown(event)

    return event.defaultPrevented
  }

  const inputEvents = createInputEventHandlers({
    isIOS: isIOS(),
    isComposing,
    isCompositionKeyEvent,
    handleKeyAction,
    insertLineBreak,
    startComposition,
    endComposition,
    hideSuggestions,
    onKeyUp: event => options.onKeyUp(event),
    onBeforeInput: event => options.onBeforeInput(event)
  })

  const editorAttributes = computed(() => options.attributes(suggestions))

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

      ...inputEvents,

      handleDOMEvents: {
        ...inputEvents.handleDOMEvents,

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
        options.onLayoutChange()
      })
    },

    onSelectionUpdate: updateTarget,

    onFocus: () => {
      updateInputRuntimeState({ focused: true })
      options.onFocus()
    },

    onBlur: () => {
      updateInputRuntimeState({ focused: false })
      hideSuggestions()
      options.onBlur()
    }
  })

  watch(
    () => [editor.value, props.markdown] as const,
    () =>
      updateInputRuntimeState({
        markdown: props.mode === 'message' && props.markdown
      })
  )

  const syncEditorAttributes = () => {
    const current = editor.value
    if (current && !current.isDestroyed && !isComposing())
      current.setOptions({})
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
    options.onLayoutChange()
  })

  watch(
    () => props.readonly,
    value => editor.value?.setEditable(!value, false)
  )

  useMarkdownReferenceLabels(editor, label)

  const focus: ReferenceInputHandle['focus'] = position =>
    editor.value?.commands.focus(position)
  const element = computed(() => editor.value?.view.dom)

  useResizeObserver(element, () => {
    updatePosition()
    options.onLayoutChange()
  })

  return { editor, suggestions, focus, insertText, insertLineBreak, element }
}
