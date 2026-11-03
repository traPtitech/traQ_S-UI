import { closeHistory } from '@tiptap/pm/history'
import {
  type EditorState,
  Plugin,
  PluginKey,
  TextSelection
} from '@tiptap/pm/state'

import { isComposingInput } from './composition'
import { inputLifecycleKey } from './inputLifecycle'
import { markdownIndent } from './markdownIndent'

export type MarkdownListCompletion = {
  from: number
  to: number
  text: string
  continuation: string
  child: string
}

export const markdownListInputKey = new PluginKey<
  MarkdownListCompletion | undefined
>('markdownListInput')

export const changeMarkdownListCompletion = (
  state: EditorState,
  action: 'continue' | 'nest'
) => {
  const completion = markdownListInputKey.getState(state)

  if (
    !completion ||
    !state.selection.empty ||
    state.selection.head !== completion.to ||
    state.doc.textBetween(completion.from, completion.to) !== completion.text
  )
    return

  const text =
    action === 'continue' ? completion.continuation : completion.child

  const transaction = closeHistory(state.tr).insertText(
    text,
    completion.from,
    completion.to
  )

  transaction.setSelection(
    TextSelection.create(transaction.doc, completion.from + text.length)
  )

  return transaction.setMeta(markdownListInputKey, null).scrollIntoView()
}

/** 空の項目の補完操作と、Markdown 入力欄の Tab 編集を扱う。 */
export const markdownListInput = () =>
  new Plugin<MarkdownListCompletion | undefined>({
    key: markdownListInputKey,

    state: {
      init: () => undefined,

      apply: (transaction, previous, oldState) => {
        const completion = transaction.getMeta(markdownListInputKey) as
          MarkdownListCompletion | null | undefined
        if (completion !== undefined) return completion ?? undefined

        const preview = transaction.getMeta(inputLifecycleKey) as
          | { markdown?: boolean; focused?: boolean; composing?: boolean }
          | undefined

        if (
          transaction.docChanged ||
          !transaction.selection.eq(oldState.selection) ||
          preview?.markdown === false ||
          preview?.focused === false ||
          preview?.composing === true
        )
          return undefined

        return previous
      }
    },

    props: {
      handleKeyDown: (view, event) => {
        if (
          !view.editable ||
          isComposingInput(
            view,
            event,
            () => !!inputLifecycleKey.getState(view.state)?.composing
          ) ||
          event.ctrlKey ||
          event.metaKey ||
          event.altKey ||
          (event.shiftKey && event.key !== 'Tab') ||
          !inputLifecycleKey.getState(view.state)?.markdown ||
          (event.key !== 'Backspace' && event.key !== 'Tab')
        )
          return false

        if (event.key === 'Tab') {
          const completion = !event.shiftKey
            ? changeMarkdownListCompletion(view.state, 'nest')
            : undefined

          const transaction =
            completion ??
            markdownIndent(view.state, event.shiftKey ? 'outdent' : 'indent')

          if (transaction.docChanged) view.dispatch(transaction)

          return true
        }

        const transaction = changeMarkdownListCompletion(view.state, 'continue')
        if (!transaction) return false

        view.dispatch(transaction)

        return true
      },

      handleDOMEvents: {
        beforeinput: (view, event) => {
          if (
            !view.editable ||
            isComposingInput(
              view,
              event,
              () => !!inputLifecycleKey.getState(view.state)?.composing
            ) ||
            !event.cancelable ||
            !inputLifecycleKey.getState(view.state)?.markdown ||
            event.inputType !== 'deleteContentBackward'
          )
            return false

          const transaction = changeMarkdownListCompletion(
            view.state,
            'continue'
          )

          if (!transaction) return false

          view.dispatch(transaction)
          event.preventDefault()

          return true
        }
      }
    }
  })
