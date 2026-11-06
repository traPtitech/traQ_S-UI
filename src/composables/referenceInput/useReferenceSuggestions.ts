import { computed, shallowRef } from 'vue'

import type { Editor } from '@tiptap/core'

import useWordSuggestionList from '/@/composables/suggestion/useWordSuggestionList'
import { isMobilePlatform } from '/@/lib/dom/browser'
import { analyzeEditorProbe } from '/@/lib/referenceInput/documentAnalysis'
import { editInput } from '/@/lib/referenceInput/editOperation'
import { editorTextBetween } from '/@/lib/referenceInput/editorText'
import {
  type SuggestionTarget,
  acceptsCandidate,
  findSuggestionTarget,
  isStampSuggestion
} from '/@/lib/referenceInput/suggestion'
import {
  type SuggestionNavigation,
  type SuggestionState,
  type SuggestionTransition,
  appendSuggestionEffect,
  confirmSuggestion,
  continueSuggestionPath,
  descendSuggestionPath,
  keepsSuggestionCycle,
  previewSuggestion,
  suggestTarget,
  suggestionKeyAction,
  suggestionShortcuts
} from '/@/lib/referenceInput/suggestionState'
import { type InputMode, type InputPart } from '/@/lib/references'
import type { Candidate, SuggestionWord } from '/@/lib/suggestion/types'
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
  const allowAsciiSuggestionsDuringComposition = isMobilePlatform()
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

  const canContinuePath = (word: SuggestionWord) =>
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
    allowAsciiSuggestionsDuringComposition &&
    !!current &&
    /^[\x21-\x7e]+$/.test(current.word)

  const update = () => {
    if (applyingCompletion) return

    const editor = options.editor()

    if (!editor || !editor.isEditable || !editor.isFocused) {
      hide()

      return
    }

    const { from, to } = editor.state.selection

    // 手入力やカーソル移動があれば、現在の原文から候補を検索し直す。
    const keepCycle = keepsSuggestionCycle(
      state.value,
      editor.state.doc,
      editor.state.selection
    )

    let next: SuggestionTarget | undefined

    if (keepCycle) {
      next = cycle.value?.target
    } else if (from === to) {
      next = findSuggestionTarget(
        editorTextBetween(editor.state.doc, 1, from),
        from,
        options.mode(),
        source => analyzeEditorProbe(editor.state.doc, source)
      )
    }

    if (options.isComposing() && !canSuggestDuringComposition(next)) {
      hide()

      return
    }

    if (!keepCycle) {
      state.value = suggestTarget(next)

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

  const applyTransition = (transition: SuggestionTransition | undefined) => {
    const editor = options.editor()
    if (!transition || !editor?.isEditable || options.isComposing())
      return false

    const next = transition.nextState
    state.value = next
    applyingCompletion = true

    try {
      const edit = transition.edit
      if (edit) {
        const onlyPart = edit.parts.length === 1 ? edit.parts[0] : undefined
        const unchanged =
          onlyPart?.type === 'text' &&
          editorTextBetween(
            editor.state.doc,
            edit.range.from,
            edit.range.to
          ) === onlyPart.text

        if (!unchanged)
          editInput(editor, () => options.insertParts(edit.parts, edit.range))
      }

      const stampId = transition.effects?.recordStamp
      if (stampId) {
        upsertLocalStampHistory(stampId, new Date())
        recordStampUsage(stampId)
      }
    } finally {
      applyingCompletion = false
      if (state.value === next && next.status === 'cycling')
        state.value = { ...next, doc: editor.state.doc }
      if (transition.effects?.refreshTarget) update()
    }

    return true
  }

  const confirmCandidate = (word: SuggestionWord) => {
    if (deferCompositionAction(() => confirmCandidate(word))) return

    applyTransition(confirmSuggestion(state.value, word, dmChannelId))
  }

  const cycleCandidatePreview = (navigation: SuggestionNavigation) => {
    const editor = options.editor()
    if (!editor || state.value.status === 'closed') return

    applyTransition(
      previewSuggestion(
        state.value,
        candidates.value,
        editor.state.doc,
        navigation,
        dmChannelId
      )
    )
  }

  const appendEffect = (word: SuggestionWord) => {
    if (deferCompositionAction(() => appendEffect(word))) return

    applyTransition(appendSuggestionEffect(state.value, word, dmChannelId))
  }

  const continuePath = (word: SuggestionWord, appendSlash = false) => {
    if (!canContinuePath(word)) return
    if (deferCompositionAction(() => continuePath(word, appendSlash))) return

    applyTransition(
      continueSuggestionPath(state.value, word, appendSlash, dmChannelId)
    )
  }

  const descendAndPreviewChild = (word: SuggestionWord) => {
    if (!canContinuePath(word)) return

    const changed = applyTransition(
      descendSuggestionPath(state.value, word, dmChannelId)
    )
    if (changed)
      cycleCandidatePreview({ direction: 'next', initialSelection: 'boundary' })
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
        cycleCandidatePreview({
          direction: action === 'previous' ? 'previous' : 'next',
          initialSelection: event.key === 'Tab' ? 'boundary' : 'advance'
        })
        break

      case 'confirm': {
        const word = candidate?.word ?? parentChannel.value
        if (word) confirmCandidate(word)
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
    confirmCandidate,
    continuePath,
    appendEffect,
    onKeyDown
  }
}

export default useReferenceSuggestions
