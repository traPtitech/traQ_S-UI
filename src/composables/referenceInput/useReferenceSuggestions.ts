import { computed, ref, shallowRef } from 'vue'

import type { Editor } from '@tiptap/core'
import { closeHistory } from '@tiptap/pm/history'
import { useEventListener } from '@vueuse/core'

import useWordSuggestionList from '/@/composables/suggestion/useWordSuggestionList'
import {
  type SuggestionTarget,
  acceptsCandidate,
  completeCandidate,
  completedChannelPath,
  findSuggestionTarget
} from '/@/lib/referenceInput/suggestion'
import {
  type SuggestionState,
  suggestionKeyAction,
  suggestionShortcuts
} from '/@/lib/referenceInput/suggestionState'
import { type InputMode, type InputPart, inputText } from '/@/lib/references'
import type { Candidate, Word } from '/@/lib/suggestion/types'
import { useStampHistory } from '/@/store/domain/stampHistory'
import { useStampRecommendations } from '/@/store/domain/stampRecommendations'
import { useChannelsStore } from '/@/store/entities/channels'

type Options = {
  editor: () => Editor | undefined
  mode: () => InputMode
  isComposing: () => boolean
  insertParts: (parts: InputPart[], range: { from: number; to: number }) => void
}

const CARET_GAP = 8

const useReferenceSuggestions = (options: Options) => {
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

  const position = ref({ top: 0, left: 0 })
  let applyingCompletion = false

  const { suggestedCandidateWords, parentChannel } = useWordSuggestionList(
    () => target.value?.word ?? '',
    2
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
              display: word.type === 'stamp' ? `${word.text}:` : word.text
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
    hasChildTarget: !!childTarget.value
  }))

  const shortcuts = computed(() => suggestionShortcuts(keyContext.value))

  const hide = () => {
    state.value = { status: 'closed' }
  }

  const update = () => {
    if (applyingCompletion) return

    const editor = options.editor()

    if (
      !editor ||
      !editor.isEditable ||
      options.isComposing() ||
      !editor.isFocused
    ) {
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

    if (!keepCycle) {
      state.value =
        next && next.word.length >= 2
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

  const updatePosition = (keepHorizontal = false) => {
    const editor = options.editor()
    const current = target.value
    if (!editor || editor.isDestroyed || !shown.value || !current) return

    const stamp =
      current.mode === 'message' &&
      ['user-icon', 'stamp', 'stamp-effect'].includes(current.intent)
    const { view } = editor
    const start = view.coordsAtPos(current.from, -1)
    const top = current.mode === 'search' ? start.bottom : start.top

    position.value = {
      top: stamp
        ? Math.min(top, view.coordsAtPos(current.to, -1).top) - CARET_GAP
        : top,
      left: keepHorizontal ? position.value.left : start.left
    }
  }

  const reposition = () => updatePosition()
  useEventListener(document, 'scroll', reposition, {
    capture: true,
    passive: true
  })
  useEventListener(window, 'resize', reposition, { passive: true })
  useEventListener(window.visualViewport, ['resize', 'scroll'], reposition, {
    passive: true
  })

  const select = (word: Word) => {
    const current = target.value

    if (!current || !options.editor()?.isEditable || options.isComposing())
      return

    const parts = completeCandidate(current, word, dmChannelId)
    if (!parts) return

    options.insertParts(parts, current)

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

    // 補完を一回の Undo で戻せるように前後の入力と履歴を分ける。
    editor.view.dispatch(closeHistory(editor.state.tr))
    options.insertParts([{ type: 'text', text }], range)
    editor.view.dispatch(closeHistory(editor.state.tr))
  }

  const previewCandidate = (backward: boolean, moveFromSelection: boolean) => {
    const editor = options.editor()
    const current = target.value
    if (!editor || !current || options.isComposing()) return

    const choices = candidates.value
    let index = backward ? choices.length - 1 : 0

    // Tab は最初の候補を反映し、上下矢印は現在の選択から直接移動する。
    if ((cycle.value || moveFromSelection) && selectedIndex.value >= 0) {
      index =
        (selectedIndex.value + (backward ? -1 : 1) + choices.length) %
        choices.length
    }

    const candidate = choices[index]
    if (!candidate) return

    const parts = completeCandidate(current, candidate.word, dmChannelId)
    if (!parts) return

    // 確定時と同じ表記を原文へ反映
    const text = inputText(parts).replace(/ $/, '')

    const next: Extract<SuggestionState, { status: 'cycling' }> = {
      status: 'cycling',
      selection: { type: 'candidate', index },
      candidates: choices,
      target: { ...current, to: current.from + text.length },
      doc: editor.state.doc
    }

    state.value = next
    applyingCompletion = true

    try {
      insertCompletionText(text, current)
    } finally {
      applyingCompletion = false
      if (state.value === next) state.value = { ...next, doc: editor.state.doc }
      update()
    }
  }

  const continuePath = (word: Word, appendSlash = false) => {
    const current = target.value

    if (
      !current ||
      options.isComposing() ||
      !canContinuePath(word) ||
      !acceptsCandidate(current, word, dmChannelId)
    )
      return

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

  const completeChildPath = (word: Word) => {
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
    if (!shown.value || !candidates.value.length) return false

    const action = suggestionKeyAction(event, keyContext.value)
    const candidate = candidates.value[selectedIndex.value]

    switch (action) {
      case 'append-path':
        if (candidate) continuePath(candidate.word, true)
        break

      case 'descend':
        if (childTarget.value) completeChildPath(childTarget.value)
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
    onKeyDown
  }
}

export default useReferenceSuggestions
