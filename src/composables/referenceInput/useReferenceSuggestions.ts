import { computed, shallowRef } from 'vue'

import type { Editor } from '@tiptap/core'

import useWordSuggestionList from '/@/composables/suggestion/useWordSuggestionList'
import { isTouchDevice } from '/@/lib/dom/browser'
import { editInput } from '/@/lib/referenceInput/editOperation'
import {
  type SuggestionTarget,
  acceptsCandidate,
  completedChannelPath,
  confirmCandidateParts,
  findSuggestionTarget,
  isStampSuggestion,
  previewCandidateText
} from '/@/lib/referenceInput/suggestion'
import {
  type SuggestionState,
  previewSuggestion,
  suggestionKeyAction,
  suggestionShortcuts
} from '/@/lib/referenceInput/suggestionState'
import { type InputMode, type InputPart } from '/@/lib/references'
import type { Candidate, Word } from '/@/lib/suggestion/types'
import { useStampHistory } from '/@/store/domain/stampHistory'
import { useStampRecommendations } from '/@/store/domain/stampRecommendations'
import { useChannelsStore } from '/@/store/entities/channels'

import { useSuggestionPosition } from './useSuggestionPosition'

type Options = {
  editor: () => Editor | undefined
  mode: () => InputMode
  isComposing: () => boolean
  finishComposition: (action: () => void) => void
  insertParts: (parts: InputPart[], range: { from: number; to: number }) => void
}

const useReferenceSuggestions = (options: Options) => {
  const touchDevice = isTouchDevice()
  const { channelsMap, userIdToDmChannelIdMap } = useChannelsStore()
  const { upsertLocalStampHistory } = useStampHistory()
  const { recordStampUsage } = useStampRecommendations()

  const dmChannelId = (userId: string) =>
    userIdToDmChannelIdMap.value.get(userId)

  const state = shallowRef<SuggestionState>({ status: 'closed' })

  const target = computed(() =>
    state.value.status === 'closed' ? undefined : state.value.target
  )

  const shown = computed(() => state.value.status !== 'closed')

  const selectedIndex = computed(() =>
    state.value.status === 'closed' || state.value.selection.type === 'parent'
      ? -1
      : state.value.selection.index
  )

  const cycle = computed(() =>
    state.value.status === 'cycling' ? state.value : undefined
  )

  const { position, updatePosition } = useSuggestionPosition({
    editor: options.editor,
    target: () => target.value,
    shown: () => shown.value
  })

  let applyingCompletion = false

  const { suggestedCandidateWords, parentChannel } = useWordSuggestionList(
    () => target.value?.word ?? '',
    1
  )

  const canContinuePath = (word: Word) =>
    word.type === 'channel' &&
    (channelsMap.value
      .get(word.id)
      ?.children.some(id => channelsMap.value.has(id)) ??
      false)

  const candidates = computed<Candidate[]>(() => {
    if (cycle.value) return cycle.value.candidates

    const current = target.value
    if (!current) return []

    return suggestedCandidateWords.value
      .filter(word => acceptsCandidate(current, word, dmChannelId))
      .map(word =>
        word.type === 'channel'
          ? { word, display: word.text, canContinuePath: canContinuePath(word) }
          : {
              word,
              canAppendEffect: isStampSuggestion(current),
              display: word.type === 'stamp' ? `${word.text}:` : word.text,
              preview:
                current.mode === 'message' && current.intent === 'stamp-effect'
                  ? `${current.stampPrefix}${word.text}:`
                  : undefined
            }
      )
  })

  const childTarget = computed(() => {
    const candidate = candidates.value[selectedIndex.value]

    if (!candidate) return parentChannel.value

    return candidate.canContinuePath ? candidate.word : undefined
  })

  const keyContext = computed(() => ({
    cycling: !!cycle.value,
    count: candidates.value.length,
    canDescend: !!candidates.value[selectedIndex.value]?.canContinuePath,
    hasChildTarget: !!childTarget.value,
    canAppendEffect: !!target.value && isStampSuggestion(target.value)
  }))

  const shortcuts = computed(() => suggestionShortcuts(keyContext.value))

  const hide = () => {
    state.value = { status: 'closed' }
  }

  const canSuggestDuringComposition = (current?: SuggestionTarget) =>
    touchDevice && !!current && /^[\x21-\x7e]+$/.test(current.word)

  const update = () => {
    if (applyingCompletion) return

    const editor = options.editor()

    if (!editor || !editor.isEditable || !editor.isFocused) {
      hide()

      return
    }

    const { from, to } = editor.state.selection

    // 手入力やカーソル移動があれば、現在の原文から候補を検索し直す。
    const keepCycle =
      cycle.value &&
      editor.state.doc === cycle.value.doc &&
      from === to &&
      to === cycle.value.target.to

    let next: SuggestionTarget | undefined

    if (keepCycle) {
      next = cycle.value?.target
    } else if (from === to) {
      next = findSuggestionTarget(
        editor.state.doc.textBetween(1, from, '', '\uFFFC'),
        from,
        options.mode()
      )
    }

    if (options.isComposing() && !canSuggestDuringComposition(next)) {
      hide()

      return
    }

    if (!keepCycle) {
      state.value =
        next &&
        (next.word.length >= 2 ||
          (next.mode === 'message' && next.intent === 'stamp-effect'))
          ? {
              status: 'suggesting',
              target: next,
              selection: { type: 'candidate', index: 0 }
            }
          : { status: 'closed' }

      if (state.value.status !== 'closed' && parentChannel.value)
        state.value = { ...state.value, selection: { type: 'parent' } }
    }

    updatePosition(!!keepCycle)
  }

  const deferCompositionAction = (action: () => void) => {
    if (!options.isComposing()) return false

    const editor = options.editor()
    if (editor && canSuggestDuringComposition(target.value)) {
      const { doc, selection } = editor.state
      options.finishComposition(() => {
        if (
          options.editor() !== editor ||
          editor.isDestroyed ||
          !editor.isEditable ||
          options.isComposing() ||
          editor.state.doc !== doc ||
          !editor.state.selection.eq(selection)
        )
          return

        editor.view.focus()
        update()
        action()
      })
    }

    return true
  }

  const select = (word: Word) => {
    const current = target.value
    const editor = options.editor()

    if (!current || !editor?.isEditable) return
    if (deferCompositionAction(() => select(word))) return

    const parts = confirmCandidateParts(current, word, dmChannelId)
    if (!parts) return

    editInput(editor, () => options.insertParts(parts, current))

    if (word.type === 'stamp') {
      upsertLocalStampHistory(word.id, new Date())
      recordStampUsage(word.id)
    }

    hide()
  }

  const insertCompletionText = (
    text: string,
    range: { from: number; to: number }
  ) => {
    const editor = options.editor()
    if (!editor || options.isComposing()) return

    if (
      editor.state.doc.textBetween(range.from, range.to, '', '\uFFFC') === text
    )
      return

    editInput(editor, () =>
      options.insertParts([{ type: 'text', text }], range)
    )
  }

  const previewCandidate = (backward: boolean, moveFromSelection: boolean) => {
    const editor = options.editor()
    const current = target.value
    if (!editor || !current || options.isComposing()) return

    if (state.value.status === 'closed') return

    const preview = previewSuggestion(
      state.value,
      candidates.value,
      editor.state.doc,
      backward,
      moveFromSelection,
      dmChannelId
    )
    if (!preview) return

    const next = preview.state

    state.value = next
    applyingCompletion = true

    try {
      insertCompletionText(preview.edit.text, preview.edit.range)
    } finally {
      applyingCompletion = false
      if (state.value === next) state.value = { ...next, doc: editor.state.doc }
      update()
    }
  }

  const appendEffect = (word: Word) => {
    const current = target.value
    if (
      !current ||
      !isStampSuggestion(current) ||
      !options.editor()?.isEditable
    )
      return
    if (deferCompositionAction(() => appendEffect(word))) return

    const text = previewCandidateText(current, word, dmChannelId)
    if (text === undefined) return

    insertCompletionText(text + '.', current)
    update()
  }

  const continuePath = (word: Word, appendSlash = false) => {
    const current = target.value

    if (
      !current ||
      !canContinuePath(word) ||
      !acceptsCandidate(current, word, dmChannelId)
    )
      return

    if (deferCompositionAction(() => continuePath(word, appendSlash))) return

    state.value = {
      status: 'suggesting',
      target: current,
      selection: { type: 'parent' }
    }

    insertCompletionText(
      completedChannelPath(current, word.text + (appendSlash ? '/' : '')),
      current
    )

    update()
  }

  const descendAndPreviewChild = (word: Word) => {
    const current = target.value

    if (
      !current ||
      options.isComposing() ||
      !canContinuePath(word) ||
      !acceptsCandidate(current, word, dmChannelId)
    )
      return

    // 置換範囲は保ち、子候補の検索に使うパスだけを切り替える。
    state.value = {
      status: 'suggesting',
      target: { ...current, word: word.text },
      selection: { type: 'parent' }
    }

    previewCandidate(false, false)
  }

  const onKeyDown = (event: KeyboardEvent) => {
    if (options.isComposing() || !shown.value || !candidates.value.length)
      return false

    const action = suggestionKeyAction(event, keyContext.value)
    const candidate = candidates.value[selectedIndex.value]

    switch (action) {
      case 'append-path':
        if (candidate) continuePath(candidate.word, true)
        break

      case 'append-effect':
        if (candidate) appendEffect(candidate.word)
        break

      case 'descend':
        if (childTarget.value) descendAndPreviewChild(childTarget.value)
        break

      case 'preview':
      case 'next':
      case 'previous':
        previewCandidate(action === 'previous', event.key !== 'Tab')
        break

      case 'confirm': {
        const word = candidate?.word ?? parentChannel.value
        if (word) select(word)
        break
      }

      case 'dismiss':
        hide()
        break

      default:
        return false
    }

    return true
  }

  return {
    shown,
    candidates,
    shortcuts,
    selectedIndex,
    position,
    update,
    updatePosition,
    hide,
    select,
    continuePath,
    appendEffect,
    onKeyDown
  }
}

export default useReferenceSuggestions
