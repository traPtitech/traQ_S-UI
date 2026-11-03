import { type Store, traQMarkdownIt } from '@traptitech/traq-markdown-it'

import type { Editor } from '@tiptap/core'
import { undo } from '@tiptap/pm/history'

import { analyzeMarkdownSource } from '/@/lib/markdown/analysis'
import { inputLifecycleKey } from '/@/lib/referenceInput/inputLifecycle'
import { markdownLineBreak } from '/@/lib/referenceInput/markdownLineBreak'
import { markdownListInputKey } from '/@/lib/referenceInput/markdownListInput'
import { encodeReference } from '/@/lib/references'

import { createInputEditor, readSource as source } from './fixture'

const renderer = new traQMarkdownIt({} as Store, [], 'https://example.com')

const create = createInputEditor

const tailContainers = (text: string) => {
  const containers: string[] = []

  for (const token of renderer.md.parse(text, {})) {
    if (token.tag === 'blockquote' || token.tag === 'li') {
      if (token.nesting === 1) containers.push(token.tag)
      if (token.nesting === -1) containers.pop()
    }

    if (token.type === 'inline' && token.content.includes('tail'))
      return [...containers]
  }

  return []
}

describe('Markdown container line breaks', () => {
  it.each([
    ['plain¦', 'plain\n¦'],
    ['> a¦', '> a\n> ¦'],
    ['> a¦b', '> a\n> ¦b'],
    ['> ¦text', '> \n> ¦text'],
    ['> a\nlazy¦', '> a\nlazy\n> ¦'],
    ['>> a¦', '>> a\n>> ¦'],
    ['> > a\n> b¦', '> > a\n> b\n> > ¦'],
    ['> a\n> ¦', '> a\n\n¦'],
    ['> ¦', '\n¦'],
    ['> > a\n> > ¦', '> > a\n> \n> ¦'],
    ['- a¦', '- a\n- ¦'],
    ['- a\nlazy¦', '- a\nlazy\n- ¦'],
    ['- a\n  ¦', '- a\n\n¦'],
    ['- a\n- ¦', '- a\n\n¦'],
    ['- a¦b', '- a\n- ¦b'],
    ['- ¦', '\n¦'],
    ['12. a¦', '12. a\n13. ¦'],
    ['12) a¦', '12) a\n13) ¦'],
    ['1.\ta¦', '1.\ta\n2.\t¦'],
    ['12.\ta¦', '12.\ta\n13.\t¦'],
    ['-\ta¦', '-\ta\n-\t¦'],
    ['> -\ta¦', '> -\ta\n> -\t¦'],
    ['+ a¦', '+ a\n+ ¦'],
    ['* a¦', '* a\n* ¦'],
    ['  - a¦', '  - a\n  - ¦'],
    ['- a\n  - b¦', '- a\n  - b\n  - ¦'],
    ['- a\n  - b\n    ¦', '- a\n  - b\n  \n  ¦'],
    ['> - a¦', '> - a\n> - ¦'],
    ['> - a\n>   ¦', '> - a\n> \n> ¦'],
    ['- > a¦', '- > a\n  > ¦'],
    ['- > a\n  > ¦', '- > a\n  \n  ¦'],
    ['```\n> a¦\n```', '```\n> a\n¦\n```'],
    ['```\n- a¦\n```', '```\n- a\n¦\n```'],
    ['    > a¦', '    > a\n¦'],
    ['> ```\n> - literal¦\n> ```', '> ```\n> - literal\n> ¦\n> ```'],
    ['- ```\n  - literal¦\n  ```', '- ```\n  - literal\n  ¦\n  ```'],
    ['> ```\n> ¦\n> ```', '> ```\n> \n> ¦\n> ```'],
    ['- ```\n  ¦\n  ```', '- ```\n  \n  ¦\n  ```'],
    ['-     code¦', '-     code\n      ¦'],
    ['\\> literal¦', '\\> literal\n¦'],
    ['---¦', '---\n¦'],
    ['¦\n', '\n¦\n']
  ])('continues or exits the parsed container at %s', (before, after) => {
    const original = before.replace('¦', '')
    const editor = create(original)
    const position = before.indexOf('¦') + 1
    editor.commands.setTextSelection(position)
    editor.view.dispatch(markdownLineBreak(editor.state))

    expect(source(editor)).toBe(after.replace('¦', ''))
    expect(editor.state.selection.head).toBe(after.indexOf('¦') + 1)

    undo(editor.state, editor.view.dispatch)

    expect(source(editor)).toBe(original)
    expect(editor.state.selection.head).toBe(position)
  })

  it.each([
    ['> a', ['blockquote']],
    ['> a\n> ', []],
    ['> > a\n> > ', ['blockquote']],
    ['- a', ['li']],
    ['- a\n  ', []],
    ['- a\n  - b\n    ', ['li']],
    ['> - a\n>   ', ['blockquote']],
    ['- > a\n  > ', ['li']]
  ])(
    'matches the message renderer after continuing or leaving %s',
    (before, expected) => {
      const editor = create(before)
      editor.commands.setTextSelection(editor.state.doc.content.size - 1)
      editor.view.dispatch(markdownLineBreak(editor.state))
      editor.commands.insertContent('tail')

      expect(tailContainers(source(editor))).toEqual(expected)
    }
  )

  it('preserves reference IDs when inserting a continuation and undoing it', () => {
    const reference = encodeReference({
      type: 'user',
      id: 'user-id',
      raw: '@alice'
    })

    const original = '> - ' + reference
    const editor = create(original)
    editor.commands.setTextSelection(editor.state.doc.content.size - 1)
    editor.view.dispatch(markdownLineBreak(editor.state))

    expect(source(editor)).toBe(original + '\n> - ')

    undo(editor.state, editor.view.dispatch)

    expect(source(editor)).toBe(original)
  })

  it('replaces a selection with a plain line break without removing other content', () => {
    const editor = create('> abc\n> def')
    editor.commands.setTextSelection({ from: 4, to: 10 })
    editor.view.dispatch(markdownLineBreak(editor.state))

    expect(source(editor)).toBe('> a\nef')
  })
})

describe('generated list prefix shortcuts', () => {
  const complete = (text: string) => {
    const editor = create(text)

    editor.view.dispatch(
      editor.state.tr.setMeta(inputLifecycleKey, {
        markdown: true,
        focused: true
      })
    )

    editor.commands.setTextSelection(editor.state.doc.content.size - 1)
    editor.view.dispatch(markdownLineBreak(editor.state))

    return editor
  }

  const key = (
    editor: Editor,
    name: string,
    options: KeyboardEventInit = {}
  ) => {
    const event = new KeyboardEvent('keydown', {
      key: name,
      bubbles: true,
      cancelable: true,
      ...options
    })

    editor.view.dom.dispatchEvent(event)

    return event
  }

  it.each([
    ['- aaa', '- aaa\n- ', '- aaa\n  ', '- aaa\n  - '],
    ['+ aaa', '+ aaa\n+ ', '+ aaa\n  ', '+ aaa\n  + '],
    ['12. aaa', '12. aaa\n13. ', '12. aaa\n    ', '12. aaa\n    1. '],
    ['9) aaa', '9) aaa\n10) ', '9) aaa\n   ', '9) aaa\n   1) '],
    ['> - aaa', '> - aaa\n> - ', '> - aaa\n>   ', '> - aaa\n>   - '],
    [
      '- aaa\n  - bbb',
      '- aaa\n  - bbb\n  - ',
      '- aaa\n  - bbb\n    ',
      '- aaa\n  - bbb\n    - '
    ]
  ])(
    'offers a sibling, continuation, or child after %s',
    (before, sibling, continuation, child) => {
      for (const action of ['Backspace', 'Tab']) {
        const editor = complete(before)

        expect(source(editor)).toBe(sibling)
        expect(key(editor, action).defaultPrevented).toBe(true)
        expect(source(editor)).toBe(
          action === 'Backspace' ? continuation : child
        )
        expect(markdownListInputKey.getState(editor.state)).toBeUndefined()

        undo(editor.state, editor.view.dispatch)
        expect(source(editor)).toBe(sibling)

        undo(editor.state, editor.view.dispatch)
        expect(source(editor)).toBe(before)
      }
    }
  )

  it.each([
    ['- aaa', '- aaa\n  '],
    ['12. aaa', '12. aaa\n    '],
    ['> - aaa', '> - aaa\n>   '],
    ['> quote\n> ', '> quote\n\n']
  ])(
    'can directly continue an item without changing quote behavior: %s',
    (before, after) => {
      const editor = create(before)
      editor.commands.setTextSelection(editor.state.doc.content.size - 1)

      editor.view.dispatch(
        markdownLineBreak(editor.state, { continueItem: true })
      )

      expect(source(editor)).toBe(after)
      expect(markdownListInputKey.getState(editor.state)).toBeUndefined()
    }
  )

  it('matches the rendered structure for all three input choices', () => {
    for (const [action, depth] of [
      ['Enter', 1],
      ['Backspace', 1],
      ['Tab', 2]
    ] as const) {
      const editor = complete('- aaa')
      if (action !== 'Enter') key(editor, action)
      editor.commands.insertContent('tail')

      expect(tailContainers(source(editor))).toEqual(Array(depth).fill('li'))
      expect(
        renderer.md
          .parse(source(editor), {})
          .filter(token => token.type === 'list_item_open')
      ).toHaveLength(action === 'Backspace' ? 1 : 2)
    }
  })

  it('cancels the generated prefix for a software keyboard Backspace', () => {
    const editor = complete('- aaa')

    const event = new InputEvent('beforeinput', {
      inputType: 'deleteContentBackward',
      bubbles: true,
      cancelable: true
    })

    editor.view.dom.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(true)
    expect(source(editor)).toBe('- aaa\n  ')
    key(editor, 'Backspace')
    expect(source(editor)).toBe('- aaa\n ')
  })

  it('inserts whitespace in a manually written marker without treating it as a completion', () => {
    const editor = create('- aaa\n- ')

    editor.view.dispatch(
      editor.state.tr.setMeta(inputLifecycleKey, { markdown: true })
    )

    editor.commands.setTextSelection(editor.state.doc.content.size - 1)

    expect(key(editor, 'Tab').defaultPrevented).toBe(true)
    expect(source(editor)).toBe('- aaa\n-   ')
    key(editor, 'Backspace')
    expect(source(editor)).toBe('- aaa\n-  ')
  })

  it('stops handling the completion after typing and deleting the typed text', () => {
    const editor = complete('- aaa')
    editor.commands.insertContent('x')
    key(editor, 'Backspace')
    key(editor, 'Backspace')

    expect(source(editor)).toBe('- aaa\n-')
  })

  it('stops handling the completion after the cursor moves away and returns', () => {
    const editor = complete('- aaa')
    const position = editor.state.selection.head
    editor.commands.setTextSelection(position - 1)
    editor.commands.setTextSelection(position)
    key(editor, 'Backspace')

    expect(source(editor)).toBe('- aaa\n-')
  })

  it.each([{ markdown: false }, { focused: false }, { composing: true }])(
    'clears completion state on %j',
    options => {
      const editor = complete('- aaa')
      editor.view.dispatch(editor.state.tr.setMeta(inputLifecycleKey, options))

      expect(markdownListInputKey.getState(editor.state)).toBeUndefined()
    }
  )

  it('does not mark a new item containing moved text as an empty completion', () => {
    const editor = create('- aaabbb')
    editor.commands.setTextSelection(6)
    editor.view.dispatch(markdownLineBreak(editor.state))

    expect(source(editor)).toBe('- aaa\n- bbb')
    expect(markdownListInputKey.getState(editor.state)).toBeUndefined()
  })
})

describe('parsed container display contexts', () => {
  it.each([
    ['> first\nsecond', [1, 1], [0, 0], [0, 2]],
    ['> > first\n> second', [2, 2], [0, 0], [0, 2]],
    ['- first\nsecond', [0, 0], [1, 1], [0, 2]],
    ['12. first\nsecond', [0, 0], [1, 1], [0, 4]],
    ['> - first\nsecond', [1, 1], [1, 1], [0, 4]],
    ['```\n> text\n- item\n```', [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
    ['> ```\n> - text\n> ```', [1, 1, 1], [0, 0, 0], [0, 0, 0]]
  ])(
    'tracks lazy continuations and nesting for %s',
    (text, quotes, lists, indent) => {
      const lines = analyzeMarkdownSource(text).lines

      expect(lines.map(line => line.quoteDepth)).toEqual(quotes)
      expect(
        lines.map(
          line => line.containers.filter(part => part.type === 'list').length
        )
      ).toEqual(lists)
      expect(lines.map(line => line.indent)).toEqual(indent)
    }
  )
})
