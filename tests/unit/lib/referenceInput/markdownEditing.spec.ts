import { redo, undo } from '@tiptap/pm/history'

import { inputLifecycleKey } from '/@/lib/referenceInput/inputLifecycle'
import { encodeReference } from '/@/lib/references'

import { createInputEditor, pressKey, readSource as source } from './fixture'

const create = (source: string, position?: number) => {
  const editor = createInputEditor(source)

  editor.view.dispatch(
    editor.state.tr.setMeta(inputLifecycleKey, {
      markdown: true,
      focused: true
    })
  )

  editor.commands.setTextSelection(
    position ?? editor.state.doc.content.size - 1
  )

  return editor
}

const key = pressKey

describe('editing rendered Markdown as source text', () => {
  it.each([
    [4, 4, '**aXaa** and $x$'],
    [4, 6, '**aX** and $x$'],
    [6, 4, '**aX** and $x$']
  ])(
    'restores the pending DOM selection %s → %s when undoing text input',
    (anchor, head, after) => {
      for (const targetRanges of [true, false]) {
        const original = '**aaa** and $x$'
        const editor = create(original)
        const { view } = editor
        document.body.append(view.dom)
        view.focus()
        const from = view.domAtPos(anchor)
        const to = view.domAtPos(head)
        document
          .getSelection()
          ?.setBaseAndExtent(from.node, from.offset, to.node, to.offset)
        expect(editor.state.selection.head).toBe(original.length + 1)

        const event = new InputEvent('beforeinput', {
          inputType: 'insertText',
          data: 'X',
          bubbles: true,
          cancelable: true
        })
        const range = document.getSelection()?.getRangeAt(0)
        Object.defineProperty(event, 'getTargetRanges', {
          value: () => (targetRanges ? [range] : [])
        })
        view.dom.dispatchEvent(event)

        expect(event.defaultPrevented).toBe(true)
        expect(source(editor)).toBe(after)
        expect(editor.state.selection.head).toBe(Math.min(anchor, head) + 1)

        expect(undo(editor.state, view.dispatch)).toBe(true)
        expect(source(editor)).toBe(original)
        expect(editor.state.selection.toJSON()).toMatchObject({ anchor, head })

        expect(redo(editor.state, view.dispatch)).toBe(true)
        expect(source(editor)).toBe(after)
        expect(editor.state.selection.head).toBe(Math.min(anchor, head) + 1)
      }
    }
  )

  it('keeps the pre-edit caret when the browser replacement range differs from its selection', () => {
    const original = '**hello** and $x$'
    const editor = create(original)
    const { view } = editor
    document.body.append(view.dom)
    view.focus()
    const from = view.domAtPos(3)
    const to = view.domAtPos(8)
    document.getSelection()?.collapse(to.node, to.offset)
    const event = new InputEvent('beforeinput', {
      inputType: 'insertText',
      data: 'world',
      bubbles: true,
      cancelable: true
    })
    Object.defineProperty(event, 'getTargetRanges', {
      value: () => [
        {
          startContainer: from.node,
          startOffset: from.offset,
          endContainer: to.node,
          endOffset: to.offset
        }
      ]
    })
    view.dom.dispatchEvent(event)

    expect(source(editor)).toBe('**world** and $x$')
    expect(undo(editor.state, view.dispatch)).toBe(true)
    expect(source(editor)).toBe(original)
    expect(editor.state.selection.toJSON()).toMatchObject({
      anchor: 8,
      head: 8
    })
  })

  it('inserts at the browser target before the clicked selection reaches editor state', () => {
    const editor = create('**aaa** and $x$')
    const { node, offset } = editor.view.domAtPos(4)

    const event = new InputEvent('beforeinput', {
      inputType: 'insertText',
      data: 'X',
      bubbles: true,
      cancelable: true
    })

    Object.defineProperty(event, 'getTargetRanges', {
      value: () => [
        {
          startContainer: node,
          startOffset: offset,
          endContainer: node,
          endOffset: offset
        }
      ]
    })

    editor.view.dom.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(true)
    expect(source(editor)).toBe('**aXaa** and $x$')
    expect(editor.state.selection.head).toBe(5)
  })

  it('deletes from the DOM caret before a native arrow move reaches editor state', () => {
    const editor = create('**aaa** and $x$', 8)
    const { view } = editor
    document.body.append(view.dom)
    view.focus()

    const { node, offset } = view.domAtPos(7)
    document.getSelection()?.collapse(node, offset)
    expect(editor.state.selection.head).toBe(8)

    expect(key(editor, 'Backspace').defaultPrevented).toBe(true)
    expect(source(editor)).toBe('**aaa* and $x$')
    expect(editor.state.selection.head).toBe(6)
  })

  it.each(['**aaa**', '$x^2$'])(
    'keeps the source caret after newly typed closing delimiters: %s',
    text => {
      const editor = create('')

      for (const character of text) {
        const event = new InputEvent('beforeinput', {
          inputType: 'insertText',
          data: character,
          bubbles: true,
          cancelable: true
        })

        editor.view.dom.dispatchEvent(event)

        expect(event.defaultPrevented).toBe(true)
        expect(editor.state.selection.head).toBe(source(editor).length + 1)
      }

      expect(source(editor)).toBe(text)

      expect(editor.view.dom.querySelector('.markdown-input-hidden')).toBeNull()

      key(editor, 'Backspace')

      expect(source(editor)).toBe(text.slice(0, -1))
      expect(editor.state.selection.head).toBe(text.length)
      expect(editor.view.dom.querySelector('.markdown-input-hidden')).toBeNull()

      key(editor, 'Backspace')

      expect(source(editor)).toBe(text.slice(0, -2))
    }
  )

  it.each([
    '**aaa**',
    '_aaa_',
    '~~aaa~~',
    '==aaa==',
    '!!aaa!!',
    '`aaa`',
    '[aaa](aaa)',
    '***aaa***',
    '**_aaa_**',
    '**a👨‍👩‍👧‍👦**',
    '**aa\u0301**'
  ])(
    'Backspace immediately edits the visible closing delimiter of %s',
    before => {
      const editor = create(before)

      expect(editor.view.dom.querySelector('.markdown-input-hidden')).toBeNull()

      expect(key(editor, 'Backspace').defaultPrevented).toBe(true)
      expect(source(editor)).toBe(before.slice(0, -1))
      expect(editor.state.selection.head).toBe(before.length)
      expect(editor.view.dom.querySelector('.markdown-input-hidden')).toBeNull()

      undo(editor.state, editor.view.dispatch)

      expect(source(editor)).toBe(before)
    }
  )

  it.each([':x:', ':x.large.rotate:', ':@alice:', ':hex(ff0000):'])(
    'Backspace immediately deletes the closing colon of rendered %s',
    before => {
      const editor = create(before)
      expect(
        editor.view.dom.querySelector('.markdown-input-rendered')
      ).not.toBeNull()

      expect(key(editor, 'Backspace').defaultPrevented).toBe(true)
      expect(source(editor)).toBe(before.slice(0, -1))
      expect(editor.state.selection.head).toBe(before.length)
      expect(
        editor.view.dom.querySelector('.markdown-input-rendered')
      ).toBeNull()

      expect(undo(editor.state, editor.view.dispatch)).toBe(true)
      expect(source(editor)).toBe(before)
      expect(editor.state.selection.head).toBe(before.length + 1)
      expect(
        editor.view.dom.querySelector('.markdown-input-rendered')
      ).not.toBeNull()

      expect(redo(editor.state, editor.view.dispatch)).toBe(true)
      expect(source(editor)).toBe(before.slice(0, -1))
      expect(editor.state.selection.head).toBe(before.length)

      key(editor, 'Backspace')
      expect(source(editor)).toBe(before.slice(0, -2))
    }
  )

  it('deletes only the final colon after consecutive stamps', () => {
    const editor = create(':x::y:')
    key(editor, 'Backspace')

    expect(source(editor)).toBe(':x::y')
    expect(editor.state.selection.head).toBe(6)
    expect(
      editor.view.dom.querySelectorAll('.markdown-input-rendered')
    ).toHaveLength(1)
  })

  it.each(['keydown', 'beforeinput'])(
    'restores the pending DOM caret when undoing a stamp Backspace through %s',
    eventType => {
      const before = ':x: after'
      const editor = create(before)
      const { view } = editor
      document.body.append(view.dom)
      view.focus()
      const { node, offset } = view.domAtPos(4)
      document.getSelection()?.collapse(node, offset)
      expect(editor.state.selection.head).toBe(before.length + 1)

      const event =
        eventType === 'keydown'
          ? key(editor, 'Backspace')
          : new InputEvent('beforeinput', {
              inputType: 'deleteContentBackward',
              bubbles: true,
              cancelable: true
            })
      if (eventType === 'beforeinput') view.dom.dispatchEvent(event)

      expect(event.defaultPrevented).toBe(true)
      expect(source(editor)).toBe(':x after')
      expect(editor.state.selection.head).toBe(3)

      expect(undo(editor.state, view.dispatch)).toBe(true)
      expect(source(editor)).toBe(before)
      expect(editor.state.selection.head).toBe(4)

      expect(redo(editor.state, view.dispatch)).toBe(true)
      expect(source(editor)).toBe(':x after')
      expect(editor.state.selection.head).toBe(3)
    }
  )

  it('still reveals an image before deleting its hidden source', () => {
    const before = '![alt](https://example.test/image.png)'
    const editor = create(before)
    key(editor, 'Backspace')

    expect(source(editor)).toBe(before)
    expect(editor.view.dom.querySelector('.markdown-input-hidden')).toBeNull()
    expect(undo(editor.state, editor.view.dispatch)).toBe(false)

    key(editor, 'Backspace')
    expect(source(editor)).toBe(before.slice(0, -1))
  })

  it('renders a stamp when the caret is past it within a previously opened source range', () => {
    const editor = create(':x: ')

    editor.view.dispatch(
      editor.state.tr.setMeta(inputLifecycleKey, {
        revealed: [{ from: 0, to: 4 }]
      })
    )

    expect(
      editor.view.dom.querySelector('.markdown-input-rendered')
    ).not.toBeNull()
  })

  it.each(['| label |\n| --- |\n| value |', '$$x$$', '$$\nx^2\n$$', '$x$'])(
    'edits visible source immediately at the end of %s',
    before => {
      const editor = create(before)

      expect(key(editor, 'ArrowLeft').defaultPrevented).toBe(false)
      expect(key(editor, 'Backspace').defaultPrevented).toBe(true)
      expect(source(editor)).toBe(before.slice(0, -1))
      expect(editor.state.selection.head).toBe(before.length)

      undo(editor.state, editor.view.dispatch)

      expect(source(editor)).toBe(before)
      expect(editor.view.dom.querySelector('.markdown-input-hidden')).toBeNull()
    }
  )

  it.each([
    ['**a👨‍👩‍👧‍👦**', '**a**'],
    ['**aa\u0301**', '**a**']
  ])(
    'deletes one grapheme while editing the source body of %s',
    (before, after) => {
      const editor = create(before, before.length - 1)
      key(editor, 'Backspace')

      expect(source(editor)).toBe(after)

      undo(editor.state, editor.view.dispatch)

      expect(source(editor)).toBe(before)
    }
  )

  it('deletes only the preceding space before editing the rendered text', () => {
    const editor = create('**aaa** x', 9)
    key(editor, 'Backspace')

    expect(source(editor)).toBe('**aaa**x')

    key(editor, 'Backspace')

    expect(source(editor)).toBe('**aaa*x')
    expect(editor.state.selection.head).toBe(7)
  })

  it.each(['**aaa**', '[aaa](aaa)'])(
    'lets Left move natively over the visible source of %s',
    text => {
      const editor = create(text)

      expect(key(editor, 'ArrowLeft').defaultPrevented).toBe(false)
      expect(source(editor)).toBe(text)
      expect(editor.view.dom.querySelector('.markdown-input-hidden')).toBeNull()
    }
  )

  it('does not intercept Left from the next character', () => {
    const editor = create('**aaa** x', 9)
    const event = key(editor, 'ArrowLeft')

    expect(event.defaultPrevented).toBe(false)
    expect(editor.view.dom.querySelector('.markdown-input-hidden')).toBeNull()
    expect(source(editor)).toBe('**aaa** x')
  })

  it.each(['**aaa**', '[aaa](aaa)'])(
    'lets Right move natively over the visible source of %s',
    text => {
      const editor = create(text, 1)

      expect(key(editor, 'ArrowRight').defaultPrevented).toBe(false)
      expect(editor.state.selection.head).toBe(1)
      expect(editor.view.dom.querySelector('.markdown-input-hidden')).toBeNull()
      expect(source(editor)).toBe(text)
    }
  )

  it('Delete immediately edits the visible opening link delimiter', () => {
    const editor = create('[aaa](aaa)', 1)
    key(editor, 'Delete')

    expect(source(editor)).toBe('aaa](aaa)')
    expect(editor.state.selection.head).toBe(1)
  })

  it('keeps the source open when editing delimiters changes the parsed formatting', () => {
    const editor = create('**aaa**', 1)
    key(editor, 'Delete')

    expect(source(editor)).toBe('*aaa**')
    expect(editor.view.dom.querySelector('.markdown-input-hidden')).toBeNull()

    key(editor, 'Delete')

    expect(source(editor)).toBe('aaa**')
    expect(editor.view.dom.querySelector('.markdown-input-hidden')).toBeNull()
  })

  it('allows native selection extension through the visible closing delimiter', () => {
    const editor = create('**aaa**')
    const event = key(editor, 'ArrowLeft', { shiftKey: true })

    expect(event.defaultPrevented).toBe(false)
    expect(editor.view.dom.querySelector('.markdown-input-hidden')).toBeNull()
    expect(source(editor)).toBe('**aaa**')
  })

  it('does not delete hidden delimiters outside the selected source range', () => {
    const editor = create('**aaa**')
    editor.commands.setTextSelection({ from: 3, to: 6 })
    key(editor, 'Backspace')

    expect(source(editor)).toBe('****')
  })

  it.each([
    {
      inputType: 'deleteContentBackward',
      position: 4,
      first: ':x',
      caret: 3,
      second: ':'
    },
    {
      inputType: 'deleteContentForward',
      position: 1,
      first: ':x:',
      caret: 1,
      second: 'x:'
    }
  ])(
    'handles software-keyboard $inputType without keydown',
    ({ inputType, position, first, caret, second }) => {
      const editor = create(':x:', position)

      const event = new InputEvent('beforeinput', {
        inputType,
        bubbles: true,
        cancelable: true
      })

      editor.view.dom.dispatchEvent(event)

      expect(event.defaultPrevented).toBe(true)
      expect(source(editor)).toBe(first)
      expect(editor.state.selection.head).toBe(caret)

      const next = new InputEvent('beforeinput', {
        inputType,
        bubbles: true,
        cancelable: true
      })

      editor.view.dom.dispatchEvent(next)

      expect(source(editor)).toBe(second)
    }
  )

  it('edits visible source immediately for a software keyboard without keydown', () => {
    const editor = create('[aaa](aaa)')

    const event = new InputEvent('beforeinput', {
      inputType: 'deleteContentBackward',
      bubbles: true,
      cancelable: true
    })

    editor.view.dom.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(true)
    expect(source(editor)).toBe('[aaa](aaa')
    expect(editor.state.selection.head).toBe(10)
  })

  it('keeps reference Backspace behavior inside rendered Markdown', () => {
    const mention = encodeReference({
      type: 'user',
      id: 'user-id',
      raw: '@alice'
    })

    const editor = create(`**${mention}**`)

    expect(source(editor)).toBe(`**${mention}**`)

    editor.commands.setTextSelection(4)
    key(editor, 'Backspace')

    expect(source(editor)).toBe('**@alice**')
  })

  it('does not reopen Markdown for an IME key at a composition boundary', () => {
    const editor = create('**aaa**')

    const event = key(editor, 'Backspace', {
      isComposing: false,
      keyCode: 229
    })

    expect(event.defaultPrevented).toBe(false)
    expect(source(editor)).toBe('**aaa**')
    expect(editor.state.selection.head).toBe(8)

    expect(editor.view.dom.querySelector('.markdown-input-hidden')).toBeNull()
  })

  it('does not intercept editing while disabled, readonly, or composing', () => {
    const editor = create('**aaa**')

    editor.view.dispatch(
      editor.state.tr.setMeta(inputLifecycleKey, { markdown: false })
    )

    expect(key(editor, 'Backspace').defaultPrevented).toBe(false)

    editor.view.dispatch(
      editor.state.tr.setMeta(inputLifecycleKey, {
        markdown: true,
        composing: true
      })
    )

    expect(key(editor, 'Backspace').defaultPrevented).toBe(false)

    editor.view.dispatch(
      editor.state.tr.setMeta(inputLifecycleKey, { composing: false })
    )

    expect(
      key(editor, 'Backspace', { isComposing: true }).defaultPrevented
    ).toBe(false)

    editor.setEditable(false)

    expect(key(editor, 'Backspace').defaultPrevented).toBe(false)
    expect(source(editor)).toBe('**aaa**')
  })
})
