import { nextTick } from 'vue'

import { EditorContent } from '@tiptap/vue-3'

import DropdownSuggester from '/@/components/UI/DropdownSuggester/DropdownSuggester.vue'
import { encodeReference } from '/@/lib/references'
import { type Candidate } from '/@/lib/suggestion/types'
import { useChannelsStore } from '/@/store/entities/channels'

import {
  embedded,
  focus,
  installReferenceInputFixture,
  lastValue,
  makeInput,
  press,
  setBranchingChannelTree,
  setChannelTree
} from './fixture'

await vi.hoisted(async () => {
  await import('./mocks')
})

installReferenceInputFixture()

describe.each([
  {
    mode: 'message',
    text: '@al',
    word: { type: 'user', id: 'original-id', text: '@alice' },
    result: 'original-id'
  },
  {
    mode: 'search',
    text: 'from:@al',
    word: { type: 'user', id: 'original-id', text: '@alice' },
    result: 'original-id'
  },
  {
    mode: 'message',
    text: ':te',
    word: { type: 'stamp', id: 'test-stamp', text: ':test' },
    result: ':test: '
  }
] as const)('direct confirmation of $text', ({ mode, text, word, result }) => {
  it.each(['Enter', 'click'])(
    'keeps %s separate from typing in Undo history',
    async method => {
      const wrapper = await makeInput('', mode, false)
      await focus(wrapper)
      wrapper.vm.insertText(text)
      await nextTick()

      if (method === 'Enter') press(wrapper, 'Enter')
      else wrapper.getComponent(DropdownSuggester).vm.$emit('select', word)

      await nextTick()
      expect(lastValue(wrapper)).toContain(result)

      press(wrapper, 'z', { ctrlKey: true })
      await nextTick()
      expect(lastValue(wrapper)).toBe(text)
    }
  )
})

it('fills the first match and cycles the original prefix candidates', async () => {
  setBranchingChannelTree()
  const wrapper = await makeInput('', 'message', false)
  await wrapper.setProps({ markdown: true })
  await focus(wrapper)
  wrapper.vm.insertText('#t')
  await nextTick()

  expect(
    wrapper.get('button[data-selected="true"]').attributes('aria-label')
  ).toBe('#team')

  press(wrapper, 'Tab')
  await nextTick()

  expect(
    wrapper.get('button[data-selected="true"]').attributes('aria-label')
  ).toBe('#team')
  expect(lastValue(wrapper)).toBe('#team')
  press(wrapper, 'Tab')
  await nextTick()

  expect(
    wrapper.get('button[data-selected="true"]').attributes('aria-label')
  ).toBe('#test')
  expect(lastValue(wrapper)).toBe('#test')
  press(wrapper, 'Tab', { shiftKey: true })
  await nextTick()

  expect(
    wrapper.get('button[data-selected="true"]').attributes('aria-label')
  ).toBe('#team')
  expect(lastValue(wrapper)).toBe('#team')
  expect(wrapper.find('.reference-token').exists()).toBe(false)
  expect(document.activeElement).toBe(wrapper.vm.element)
})

describe.each(['message', 'search'] as const)(
  'single candidate completion in %s mode',
  mode => {
    it.each([
      { key: 'Tab', shiftKey: false },
      { key: 'Tab', shiftKey: true },
      { key: 'ArrowUp', shiftKey: false },
      { key: 'ArrowDown', shiftKey: false }
    ])(
      'confirms with Tab after previewing with $key (Shift: $shiftKey)',
      async ({ key, shiftKey }) => {
        for (const markdown of [true, false]) {
          setChannelTree()
          const wrapper = await makeInput('', mode, false)
          await wrapper.setProps({ markdown })
          await focus(wrapper)
          const prefix = mode === 'search' ? 'in:' : ''
          wrapper.vm.insertText(prefix + '#times/25/pe')
          await nextTick()
          expect(press(wrapper, key, { shiftKey })).toBe(false)
          await nextTick()

          for (const [key, shiftKey] of [
            ['ArrowUp', false],
            ['ArrowDown', false],
            ['Tab', true]
          ] as const) {
            expect(press(wrapper, key, { shiftKey })).toBe(false)
            await nextTick()

            expect(
              wrapper
                .get('button[data-selected="true"]')
                .attributes('aria-label')
            ).toBe('#times/25/person')
            expect(lastValue(wrapper)).toBe(prefix + '#times/25/person')
            expect(wrapper.find('.reference-token').exists()).toBe(false)
          }

          expect(press(wrapper, 'Tab')).toBe(false)
          await nextTick()

          expect(lastValue(wrapper)).toBe(
            encodeReference(
              mode === 'search'
                ? {
                    type: 'search-in',
                    id: 'person',
                    raw: prefix + '#times/25/person',
                    kind: 'channel'
                  }
                : {
                    type: 'channel',
                    id: 'person',
                    raw: prefix + '#times/25/person'
                  }
            ) + ' '
          )
          expect(wrapper.find('.reference-token').text()).toBe(
            prefix + '#times/25/person'
          )
          expect(
            wrapper.findComponent(DropdownSuggester).props('isShown')
          ).toBe(false)
          expect(document.activeElement).toBe(wrapper.vm.element)
          expect(wrapper.emitted('keydown')).toBeUndefined()
        }
      }
    )
  }
)

it('previews a fully typed candidate before confirming with a second Tab', async () => {
  setChannelTree()
  const text = '#times/25/person'
  const wrapper = await makeInput(text)
  await focus(wrapper)

  wrapper
    .getComponent(EditorContent)
    .props('editor')
    ?.commands.setTextSelection(text.length + 1)

  await nextTick()
  press(wrapper, 'Tab')
  await nextTick()
  expect(wrapper.find('.reference-token').exists()).toBe(false)
  expect(lastValue(wrapper)).toBeUndefined()

  press(wrapper, 'Tab')
  await nextTick()

  expect(lastValue(wrapper)).toBe(
    encodeReference({ type: 'channel', id: 'person', raw: text }) + ' '
  )
})

describe.each(['message', 'search'] as const)(
  'arrow completion in %s mode',
  mode => {
    it.each([
      { key: 'ArrowDown', paths: ['#test', '#testing', '#team'] },
      { key: 'ArrowUp', paths: ['#testing', '#test', '#team'] }
    ])(
      'completes adjacent candidates directly with $key',
      async ({ key, paths }) => {
        for (const markdown of [true, false]) {
          setBranchingChannelTree()

          useChannelsStore().channelsMap.value.set('testing', {
            id: 'testing',
            name: 'testing',
            parentId: null,
            children: [],
            archived: false,
            force: false,
            topic: ''
          })

          const wrapper = await makeInput('', mode, false)
          await wrapper.setProps({ markdown })
          await focus(wrapper)
          const prefix = mode === 'search' ? 'in:' : ''
          wrapper.vm.insertText(prefix + '#t')
          await nextTick()

          expect(
            wrapper.get('button[data-selected="true"]').attributes('aria-label')
          ).toBe('#team')

          for (const path of paths) {
            expect(press(wrapper, key)).toBe(false)
            await nextTick()

            expect(lastValue(wrapper)).toBe(prefix + path)
            expect(
              wrapper
                .get('button[data-selected="true"]')
                .attributes('aria-label')
            ).toBe(path)
            expect(wrapper.find('.reference-token').exists()).toBe(false)
            expect(document.activeElement).toBe(wrapper.vm.element)
          }

          expect(
            wrapper.emitted('update:modelValue')?.map(args => args[0])
          ).toEqual([prefix + '#t', ...paths.map(path => prefix + path)])

          press(wrapper, 'Tab')
          await nextTick()
          expect(lastValue(wrapper)).toBe(prefix + '#test')
          press(wrapper, 'Tab', { shiftKey: true })
          await nextTick()
          expect(lastValue(wrapper)).toBe(prefix + '#team')
          press(wrapper, 'Enter')
          await nextTick()

          expect(lastValue(wrapper)).toBe(
            encodeReference(
              mode === 'search'
                ? {
                    type: 'search-in',
                    id: 'team',
                    raw: prefix + '#team',
                    kind: 'channel'
                  }
                : { type: 'channel', id: 'team', raw: prefix + '#team' }
            ) + ' '
          )
        }
      }
    )
  }
)

it('retains only the original matches while cycling an exact parent path', async () => {
  setChannelTree()
  const { channelsMap } = useChannelsStore()

  channelsMap.value.set('tips', {
    id: 'tips',
    name: 'tips',
    parentId: null,
    children: [],
    archived: false,
    force: false,
    topic: ''
  })

  channelsMap.value.set('general', {
    id: 'general',
    name: 'general',
    parentId: null,
    children: [],
    archived: false,
    force: false,
    topic: ''
  })

  const wrapper = await makeInput('', 'message', false)
  await focus(wrapper)
  wrapper.vm.insertText('#ti')
  await nextTick()

  for (const text of ['#times', '#tips', '#times']) {
    press(wrapper, 'Tab')
    await nextTick()
    expect(lastValue(wrapper)).toBe(text)
    expect(
      wrapper
        .getComponent(DropdownSuggester)
        .props('candidates')
        ?.map((candidate: Candidate) => candidate.word.text)
    ).toEqual(['#times', '#tips'])
  }

  expect(wrapper.find('button[aria-label="#general"]').exists()).toBe(false)
  expect(wrapper.find('button[aria-label="#times/25"]').exists()).toBe(false)
  press(wrapper, 'Enter')
  await nextTick()

  expect(lastValue(wrapper)).toBe(
    encodeReference({ type: 'channel', id: 'times', raw: '#times' }) + ' '
  )
})

it.each(['message', 'search'] as const)(
  'descends through unique parents with Tab and confirms only the leaf in %s mode',
  async mode => {
    setChannelTree()
    const wrapper = await makeInput('', mode)
    await focus(wrapper)
    const prefix = mode === 'search' ? 'in:' : ''
    wrapper.vm.insertText(prefix + '#ti')
    await nextTick()
    press(wrapper, 'Tab')
    await nextTick()
    const changes = wrapper.emitted('update:modelValue')?.length

    for (const key of ['ArrowDown', 'ArrowUp']) {
      press(wrapper, key)
      await nextTick()
      expect(lastValue(wrapper)).toBe(prefix + '#times')
      expect(wrapper.emitted('update:modelValue')).toHaveLength(changes ?? 0)
    }

    expect(
      wrapper
        .getComponent(DropdownSuggester)
        .props('candidates')
        ?.map((candidate: Candidate) => candidate.word.text)
    ).toEqual(['#times'])

    for (const modifier of [
      { ctrlKey: true },
      { metaKey: true },
      { altKey: true }
    ]) {
      expect(press(wrapper, 'Tab', modifier)).toBe(true)
      expect(wrapper.emitted('update:modelValue')).toHaveLength(changes ?? 0)
    }

    for (const path of ['#times/25', '#times/25/person']) {
      expect(press(wrapper, 'Tab')).toBe(false)
      await nextTick()
      expect(lastValue(wrapper)).toBe(prefix + path)
      expect(wrapper.find('.reference-token').exists()).toBe(false)
      expect(
        wrapper
          .getComponent(DropdownSuggester)
          .props('candidates')
          ?.map((candidate: Candidate) => candidate.word.text)
      ).toEqual([path])
      expect(
        wrapper.getComponent(EditorContent).props('editor')?.state.selection
          .head
      ).toBe((prefix + path).length + 1)
      expect(document.activeElement).toBe(wrapper.vm.element)
    }

    expect(press(wrapper, 'Tab')).toBe(false)
    await nextTick()

    expect(lastValue(wrapper)).toBe(
      encodeReference(
        mode === 'search'
          ? {
              type: 'search-in',
              id: 'person',
              raw: prefix + '#times/25/person',
              kind: 'channel'
            }
          : { type: 'channel', id: 'person', raw: prefix + '#times/25/person' }
      ) + ' '
    )
  }
)

it('cycles child candidates after descending from a unique parent', async () => {
  setBranchingChannelTree()
  const wrapper = await makeInput('', 'message', false)
  await wrapper.setProps({ markdown: true })
  await focus(wrapper)
  wrapper.vm.insertText('#team/SysA')
  await nextTick()

  for (const path of [
    '#team/SysAd',
    '#team/SysAd/Client',
    '#team/SysAd/Ops',
    '#team/SysAd/Client'
  ]) {
    press(wrapper, 'Tab')
    await nextTick()
    expect(lastValue(wrapper)).toBe(path)
    expect(
      wrapper.get('button[data-selected="true"]').attributes('aria-label')
    ).toBe(path)
    expect(wrapper.find('.reference-token').exists()).toBe(false)
  }

  press(wrapper, 'Tab', { shiftKey: true })
  await nextTick()
  expect(lastValue(wrapper)).toBe('#team/SysAd/Ops')
  press(wrapper, 'Enter')
  await nextTick()

  expect(lastValue(wrapper)).toBe(
    encodeReference({ type: 'channel', id: 'ops', raw: '#team/SysAd/Ops' }) +
      ' '
  )
})

it('refreshes the completion context after typing a path separator', async () => {
  setChannelTree()
  const wrapper = await makeInput()
  await focus(wrapper)
  wrapper.vm.insertText('#ti')
  await nextTick()
  press(wrapper, 'Tab')
  await nextTick()
  wrapper.vm.insertText('/')
  await nextTick()
  press(wrapper, 'Tab')
  await nextTick()
  expect(lastValue(wrapper)).toBe('#times/25')
  expect(
    wrapper
      .getComponent(DropdownSuggester)
      .props('candidates')
      ?.map((candidate: Candidate) => candidate.word.text)
  ).toEqual(['#times/25'])

  press(wrapper, 'Tab')
  await nextTick()
  expect(lastValue(wrapper)).toBe('#times/25/person')
  expect(wrapper.find('.reference-token').exists()).toBe(false)
  press(wrapper, 'Tab')
  await nextTick()

  expect(lastValue(wrapper)).toBe(
    encodeReference({
      type: 'channel',
      id: 'person',
      raw: '#times/25/person'
    }) + ' '
  )
})

it('releases the old candidate list when the caret leaves the completion', async () => {
  setChannelTree()
  const wrapper = await makeInput()
  await focus(wrapper)
  wrapper.vm.insertText('#ti')
  await nextTick()
  press(wrapper, 'Tab')
  await nextTick()
  const editor = wrapper.getComponent(EditorContent).props('editor')
  if (!editor) throw new Error('Editor is not mounted')

  editor.commands.setTextSelection(1)
  await nextTick()
  expect(wrapper.getComponent(DropdownSuggester).props('isShown')).toBe(false)
  editor.commands.setTextSelection(7)
  await nextTick()
  press(wrapper, 'Tab')
  await nextTick()
  expect(lastValue(wrapper)).toBe('#times/25')
})

it.each(['message', 'search'] as const)(
  'keeps the dropdown at the preceding text while replacing different lengths in %s mode',
  async mode => {
    setBranchingChannelTree()

    useChannelsStore().channelsMap.value.set('testing', {
      id: 'testing',
      name: 'testing',
      parentId: null,
      children: [],
      archived: false,
      force: false,
      topic: ''
    })

    const prefix = mode === 'search' ? 'in:' : ''
    const wrapper = await makeInput(`before ${prefix}#t after`, mode)
    await focus(wrapper)
    const editor = wrapper.getComponent(EditorContent).props('editor')
    if (!editor) throw new Error('Editor is not mounted')

    let layoutShift = 0

    vi.spyOn(editor.view, 'coordsAtPos').mockImplementation(pos => ({
      top: 100,
      bottom: 120,
      left: pos * 8 + layoutShift,
      right: pos * 8 + layoutShift
    }))

    editor.commands.setTextSelection(`before ${prefix}#t`.length + 1)
    await nextTick()
    const anchor = { top: mode === 'search' ? 120 : 100, left: 64 }

    expect(wrapper.getComponent(DropdownSuggester).props('position')).toEqual(
      anchor
    )

    for (const path of ['#team', '#test', '#testing', '#team']) {
      const text = `before ${prefix}${path} after`
      layoutShift += 20
      press(wrapper, 'Tab')
      await nextTick()
      expect(lastValue(wrapper)).toBe(text)
      expect(editor.state.selection.head).toBe(text.indexOf(' after') + 1)
      expect(wrapper.getComponent(DropdownSuggester).props('position')).toEqual(
        anchor
      )
    }

    wrapper.vm.insertText(` ${prefix}#t`)
    await nextTick()

    expect(wrapper.getComponent(DropdownSuggester).props('position')).toEqual({
      top: anchor.top,
      left: (`before ${prefix}#team `.length + 1) * 8 + layoutShift
    })
  }
)

it.each([':ng:', ':test:', ':test.large:', ':@alice:'])(
  'requires a new colon to start stamp completion after %s',
  async stamp => {
    const wrapper = await makeInput()
    await focus(wrapper)
    wrapper.vm.insertText(stamp)
    await nextTick()
    wrapper.vm.insertText('te')
    await nextTick()

    expect(wrapper.getComponent(DropdownSuggester).props('isShown')).toBe(false)
    expect(lastValue(wrapper)).toBe(stamp + 'te')

    wrapper.vm.insertText(':te')
    await nextTick()
    expect(wrapper.getComponent(DropdownSuggester).props('isShown')).toBe(true)

    press(wrapper, 'Enter')
    await nextTick()
    expect(lastValue(wrapper)).toBe(stamp + 'te:test: ')
  }
)

it('preserves preview lengths and leaves stamps open while cycling', async () => {
  const wrapper = await makeInput()
  await focus(wrapper)
  wrapper.vm.insertText(':te')
  await nextTick()

  for (const text of [':test', ':testing', ':test']) {
    press(wrapper, 'Tab')
    await nextTick()
    expect(lastValue(wrapper)).toBe(text)
  }

  press(wrapper, 'Enter')
  await nextTick()
  expect(lastValue(wrapper)).toBe(':test: ')
})

it('closes a unique stamp with Tab only when confirming it', async () => {
  const wrapper = await makeInput()
  await focus(wrapper)
  wrapper.vm.insertText(':testi')
  await nextTick()
  press(wrapper, 'Tab')
  await nextTick()
  expect(lastValue(wrapper)).toBe(':testing')
  expect(wrapper.getComponent(DropdownSuggester).props('isShown')).toBe(true)

  press(wrapper, 'Tab')
  await nextTick()
  expect(lastValue(wrapper)).toBe(':testing: ')
  expect(wrapper.getComponent(DropdownSuggester).props('isShown')).toBe(false)
  expect(document.activeElement).toBe(wrapper.vm.element)
})

it('undoes a preview and starts the next completion from the restored text', async () => {
  setBranchingChannelTree()
  const wrapper = await makeInput()
  await focus(wrapper)
  wrapper.vm.insertText('#t')
  await nextTick()
  press(wrapper, 'Tab')
  await nextTick()
  press(wrapper, 'Tab')
  await nextTick()
  expect(lastValue(wrapper)).toBe('#test')
  press(wrapper, 'z', { ctrlKey: true })
  await nextTick()
  expect(lastValue(wrapper)).toBe('#team')
  press(wrapper, 'Tab')
  await nextTick()
  expect(lastValue(wrapper)).toBe('#team/SysAd')
})

it.each(['message', 'search'] as const)(
  'navigates user candidates without confirming them in %s mode',
  async mode => {
    const wrapper = await makeInput('', mode)
    await focus(wrapper)
    const text = mode === 'search' ? 'from:al' : '@al'
    wrapper.vm.insertText(text)
    await nextTick()

    for (const [key, shiftKey] of [
      ['Tab', false],
      ['Tab', true],
      ['ArrowDown', false],
      ['ArrowUp', false]
    ] as const) {
      expect(press(wrapper, key, { shiftKey })).toBe(false)
      await nextTick()

      expect(lastValue(wrapper)).toBe(
        mode === 'search' ? 'from:@alice' : '@alice'
      )
      expect(wrapper.find('.reference-token').exists()).toBe(false)
      expect(
        wrapper.getComponent(DropdownSuggester).props('selectedIndex')
      ).toBe(0)
      expect(document.activeElement).toBe(wrapper.vm.element)
    }

    press(wrapper, 'Tab')
    await nextTick()

    expect(wrapper.find('.reference-token').text()).toBe(
      mode === 'search' ? 'from:@alice' : '@alice'
    )
  }
)

it.each([{ ctrlKey: true }, { metaKey: true }, { altKey: true }])(
  'leaves modified Tab shortcuts to the browser: %j',
  async modifier => {
    setBranchingChannelTree()
    const wrapper = await makeInput()
    await focus(wrapper)
    wrapper.vm.insertText('#team')
    await nextTick()
    expect(press(wrapper, 'Tab', modifier)).toBe(true)
    expect(wrapper.getComponent(DropdownSuggester).props('selectedIndex')).toBe(
      -1
    )
    expect(lastValue(wrapper)).toBe('#team')
  }
)

it('keeps a manually typed separator and lets typing narrow child candidates', async () => {
  setBranchingChannelTree()
  const wrapper = await makeInput()
  await focus(wrapper)
  wrapper.vm.insertText('#team/SysA')
  await nextTick()
  press(wrapper, '/')
  await nextTick()
  expect(lastValue(wrapper)).toBe('#team/SysAd/')
  wrapper.vm.insertText('Cl')
  await nextTick()
  press(wrapper, 'Enter')
  await nextTick()

  expect(lastValue(wrapper)).toBe(
    encodeReference({
      type: 'channel',
      id: 'client',
      raw: '#team/SysAd/Client'
    }) + ' '
  )
})

it('normalizes fullwidth hashes and path casing when confirming', async () => {
  setChannelTree()
  const wrapper = await makeInput()
  await focus(wrapper)
  wrapper.vm.insertText('＃TI')
  await nextTick()
  press(wrapper, 'Enter')
  await nextTick()

  expect(lastValue(wrapper)).toBe(
    encodeReference({ type: 'channel', id: 'times', raw: '#times' }) + ' '
  )
})

it('undoes and redoes each path completion independently', async () => {
  setChannelTree()
  const wrapper = await makeInput()
  await focus(wrapper)
  wrapper.vm.insertText('#ti')
  await nextTick()
  press(wrapper, '/')
  await nextTick()
  press(wrapper, '/')
  await nextTick()
  press(wrapper, 'z', { ctrlKey: true })
  await nextTick()
  expect(lastValue(wrapper)).toBe('#times/')
  press(wrapper, 'y', { ctrlKey: true })
  await nextTick()
  expect(lastValue(wrapper)).toBe('#times/25/')
})

it.each(['message', 'search'] as const)(
  'reopens a %s reference as text, shows suggestions and allows completion again',
  async mode => {
    const reference =
      mode === 'message'
        ? embedded
        : encodeReference({
            type: 'search-from',
            id: 'original-id',
            raw: 'from:@alice',
            kind: 'user'
          })

    const text = mode === 'message' ? '@alice' : 'from:@alice'
    const wrapper = await makeInput(reference, mode)
    await focus(wrapper)

    wrapper
      .findComponent(EditorContent)
      .props('editor')
      ?.commands.setTextSelection(2)

    press(wrapper, 'Backspace')
    await nextTick()

    expect(lastValue(wrapper)).toBe(text)
    expect(wrapper.find('.reference-token').exists()).toBe(false)

    expect(wrapper.findComponent(DropdownSuggester).props('isShown')).toBe(true)

    press(wrapper, 'Enter')
    await nextTick()

    expect(lastValue(wrapper)).toBe(`${reference} `)
    expect(wrapper.find('.reference-token').exists()).toBe(true)
  }
)

it('does not turn a typed name into a reference until the candidate is selected', async () => {
  const wrapper = await makeInput()
  await focus(wrapper)
  wrapper.vm.insertText('@alice')
  await nextTick()

  expect(lastValue(wrapper)).toBe('@alice')

  press(wrapper, 'Enter')
  await nextTick()

  expect(lastValue(wrapper)).toBe(`${embedded} `)
  expect(wrapper.emitted('keydown')).toBeUndefined()
})
