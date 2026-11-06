import { shallowRef, watchEffect } from 'vue'

import { Node } from '@tiptap/core'
import { closeHistory } from '@tiptap/pm/history'
import {
  type Command,
  NodeSelection,
  Plugin,
  TextSelection
} from '@tiptap/pm/state'

import type { Reference } from '../references'
import { compositionSafeShortcuts, isComposingInput } from './composition'
import { syncInputSelection } from './selection'

const reopenReference =
  (label: (reference: Reference) => string): Command =>
  (state, dispatch) => {
    const { selection } = state

    const node =
      selection instanceof NodeSelection
        ? selection.node
        : selection.empty
          ? selection.$from.nodeBefore
          : null

    if (node?.type.name !== 'reference') return false

    if (dispatch) {
      const from = selection.empty
        ? selection.from - node.nodeSize
        : selection.from

      const text = label(node.attrs['reference'])

      // 再編集に戻す操作は、直前の補完確定とは独立して Undo できるようにする。
      const tr = closeHistory(state.tr).insertText(
        text,
        from,
        from + node.nodeSize
      )

      tr.setSelection(TextSelection.create(tr.doc, from + text.length))
      dispatch(tr.scrollIntoView())
    }

    return true
  }

export const referenceNode = (
  label: (reference: Reference) => string,
  isComposing?: () => boolean
) =>
  Node.create({
    name: 'reference',
    group: 'inline',
    inline: true,
    atom: true,
    selectable: true,

    addAttributes: () => ({
      reference: { default: null },
      source: { default: null }
    }),

    // クリップボードから参照を取り込む際は、検証済みのデータのみ許可する。
    renderHTML: ({ node }) => [
      'span',
      { class: 'reference-token', contenteditable: 'false' },
      label(node.attrs['reference'])
    ],

    renderText: ({ node }) => label(node.attrs['reference']),

    addNodeView:
      () =>
      ({ node }) => {
        const dom = document.createElement('span')
        dom.className = 'reference-token'
        dom.contentEditable = 'false'
        const current = shallowRef(node)

        const stop = watchEffect(
          () => {
            dom.textContent = label(current.value.attrs['reference'])
          },
          { flush: 'sync' }
        )

        return {
          dom,

          update(next) {
            if (next.type !== current.value.type) return false
            current.value = next
            return true
          },

          destroy: stop
        }
      },
    addProseMirrorPlugins: () => [
      new Plugin({
        props: {
          handleDOMEvents: {
            beforeinput: (view, event) => {
              if (
                event.inputType !== 'deleteContentBackward' ||
                !event.cancelable ||
                isComposingInput(view, event, isComposing) ||
                !view.editable ||
                !reopenReference(label)(syncInputSelection(view), view.dispatch)
              )
                return false

              event.preventDefault()
              return true
            }
          }
        }
      })
    ],

    addKeyboardShortcuts() {
      return compositionSafeShortcuts(
        {
          Backspace: () =>
            reopenReference(label)(
              this.editor.state,
              this.editor.view.dispatch
            ),

          Delete: () => {
            const { selection, tr } = this.editor.state
            const node = selection.$from.nodeAfter

            if (!selection.empty || node?.type.name !== 'reference')
              return false

            this.editor.view.dispatch(
              tr.delete(selection.from, selection.from + node.nodeSize)
            )

            return true
          }
        },
        isComposing
      )
    }
  })
