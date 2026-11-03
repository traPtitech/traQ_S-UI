import {
  suggestionKeyAction,
  suggestionShortcuts
} from '/@/lib/referenceInput/suggestionState'

const context = {
  cycling: false,
  count: 1,
  canDescend: false,
  hasChildTarget: false
}

it.each([
  [{}, 'preview', '補完'],
  [{ cycling: true }, 'confirm', '確定'],
  [{ cycling: true, count: 2 }, 'next', '移動'],
  [{ cycling: true, canDescend: true }, 'descend', '子へ移動']
] as const)(
  'keeps the Tab action and its hint consistent for %j',
  (overrides, action, description) => {
    const current = { ...context, ...overrides }
    expect(
      suggestionKeyAction(new KeyboardEvent('keydown', { key: 'Tab' }), current)
    ).toBe(action)
    expect(
      suggestionShortcuts(current).find(hint => hint.keys.includes('Tab'))
        ?.description
    ).toBe(description)
  }
)

it.each(['ctrlKey', 'metaKey', 'altKey'] as const)(
  'leaves modified shortcuts to the host: %s',
  modifier => {
    for (const key of ['Tab', 'Enter', 'ArrowRight', '/'])
      expect(
        suggestionKeyAction(
          new KeyboardEvent('keydown', { key, [modifier]: true }),
          context
        )
      ).toBeUndefined()
  }
)

it('allows Shift+Tab to cycle backward and leaves Shift+Enter to the host', () => {
  expect(
    suggestionKeyAction(
      new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true }),
      context
    )
  ).toBe('previous')
  expect(
    suggestionKeyAction(
      new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true }),
      context
    )
  ).toBeUndefined()
})
