import { nextTick } from 'vue'

import DropdownSuggester from '/@/components/UI/DropdownSuggester/DropdownSuggester.vue'
import { encodeReference } from '/@/lib/references'
import { type Candidate } from '/@/lib/suggestion/types'

import {
  focus,
  getEditor,
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

const hintText = (wrapper: Awaited<ReturnType<typeof makeInput>>) =>
  wrapper
    .getComponent(DropdownSuggester)
    .props('shortcuts')
    .map(({ keys, description }) => `${keys.join('・')} ${description}`)
    .join(' ')

it.each(['message', 'search'] as const)(
  'continues a channel path by tapping in %s mode and embeds only the final choice',
  async mode => {
    setChannelTree()
    const wrapper = await makeInput({ mode, suggestions: 'real' })
    await focus(wrapper)
    const prefix = mode === 'search' ? 'in:' : ''
    wrapper.vm.insertText(`${prefix}#ti`)
    await nextTick()

    const next = wrapper.get('button[aria-label="#times の子チャンネルを補完"]')

    await next.trigger('mousedown')

    expect(lastValue(wrapper)).toBe(`${prefix}#ti`)

    await next.trigger('click')
    await nextTick()

    expect(lastValue(wrapper)).toBe(`${prefix}#times`)
    expect(wrapper.find('.reference-token').exists()).toBe(false)
    expect(document.activeElement).toBe(wrapper.vm.element)

    await wrapper
      .get('button[aria-label="#times/25 の子チャンネルを補完"]')
      .trigger('click')

    await nextTick()

    expect(lastValue(wrapper)).toBe(`${prefix}#times/25`)

    expect(wrapper.find('button[title="子チャンネルを補完"]').exists()).toBe(
      false
    )

    await wrapper.get('button[aria-label="#times/25/person"]').trigger('click')

    await nextTick()

    expect(lastValue(wrapper)).toBe(
      encodeReference(
        mode === 'message'
          ? { type: 'channel', id: 'person', raw: `${prefix}#times/25/person` }
          : {
              type: 'search-in',
              id: 'person',
              raw: `${prefix}#times/25/person`,
              kind: 'channel'
            }
      ) + ' '
    )

    expect(wrapper.find('.reference-token').text()).toBe(
      `${prefix}#times/25/person`
    )
  }
)

it('can still select a parent channel directly', async () => {
  setChannelTree()
  const wrapper = await makeInput({ suggestions: 'real' })
  await focus(wrapper)
  wrapper.vm.insertText('#ti')
  await nextTick()
  await wrapper.get('button[aria-label="#times"]').trigger('click')

  expect(lastValue(wrapper)).toBe(
    encodeReference({ type: 'channel', id: 'times', raw: '#times' }) + ' '
  )
})

it('continues the selected channel path with the slash key', async () => {
  setChannelTree()
  const wrapper = await makeInput()
  await focus(wrapper)
  wrapper.vm.insertText('#ti')
  await nextTick()
  press(wrapper, '/')
  await nextTick()

  expect(lastValue(wrapper)).toBe('#times/')
  expect(wrapper.findComponent(DropdownSuggester).props('isShown')).toBe(true)
  expect(wrapper.emitted('keydown')).toBeUndefined()
})

it.each(['message', 'search'] as const)(
  'updates shortcut hints while completing a unique channel path in %s mode',
  async mode => {
    setChannelTree()
    const wrapper = await makeInput({ mode, suggestions: 'real' })
    await focus(wrapper)
    const prefix = mode === 'search' ? 'in:' : ''

    const help = () => hintText(wrapper)

    wrapper.vm.insertText(prefix + '#ti')
    await nextTick()

    expect(help()).toContain('Tab 補完')
    expect(help()).toContain('/・→ 子へ移動')
    expect(help()).toContain('Enter 確定')
    expect(help()).not.toContain('Shift+Tab')

    for (const path of ['#times', '#times/25']) {
      press(wrapper, 'Tab')
      await nextTick()
      expect(lastValue(wrapper)).toBe(prefix + path)
      expect(help()).toContain('Tab・/・→ 子へ移動')
    }

    press(wrapper, 'Tab')
    await nextTick()
    expect(lastValue(wrapper)).toBe(prefix + '#times/25/person')
    expect(help()).toContain('Tab・Enter 確定')
    expect(help()).not.toContain('子へ移動')
    press(wrapper, 'Tab')
    await nextTick()

    expect(wrapper.getComponent(DropdownSuggester).props('isShown')).toBe(false)
    expect(wrapper.find('.reference-token').text()).toBe(
      prefix + '#times/25/person'
    )
  }
)

it.each(['message', 'search'] as const)(
  'updates shortcut hints for cycling, manual edits, and parent confirmation in %s mode',
  async mode => {
    setBranchingChannelTree()
    const wrapper = await makeInput({ mode, suggestions: 'real' })
    await focus(wrapper)
    const prefix = mode === 'search' ? 'in:' : ''

    const help = () => hintText(wrapper)

    wrapper.vm.insertText(prefix + '#t')
    await nextTick()

    expect(help()).toContain('Tab 補完')
    expect(help()).toContain('↑・↓ 移動')
    expect(help()).toContain('/・→ 子へ移動')
    press(wrapper, 'Tab')
    await nextTick()
    expect(help()).toContain('Tab・↑・↓ 移動')
    press(wrapper, 'Tab')
    await nextTick()
    expect(lastValue(wrapper)).toBe(prefix + '#test')
    expect(help()).toContain('Tab・↑・↓ 移動')
    expect(help()).not.toContain('子へ移動')
    press(wrapper, 'Tab', { shiftKey: true })
    await nextTick()
    expect(lastValue(wrapper)).toBe(prefix + '#team')
    expect(help()).toContain('/・→ 子へ移動')

    wrapper.vm.insertText(' ' + prefix + '#team')
    await nextTick()
    expect(help()).toContain('Tab 補完')
    expect(help()).toContain('Enter 確定')
    expect(help()).toContain('→ 子へ移動')
    press(wrapper, 'Enter')
    await nextTick()
    expect(wrapper.find('.reference-token').text()).toBe(prefix + '#team')
    expect(wrapper.getComponent(DropdownSuggester).props('isShown')).toBe(false)
  }
)

describe.each(['message', 'search'] as const)(
  'child completion with ArrowRight in %s mode',
  mode => {
    it.each(['#t', '#team'])(
      'descends from %s, leaves leaf caret movement intact, and supports Undo',
      async text => {
        for (const markdown of [true, false]) {
          setBranchingChannelTree()
          const wrapper = await makeInput({ mode, suggestions: 'real' })
          await wrapper.setProps({ markdown })
          await focus(wrapper)
          const prefix = mode === 'search' ? 'in:' : ''
          wrapper.vm.insertText(prefix + text)
          await nextTick()

          for (const path of ['#team/SysAd', '#team/SysAd/Client']) {
            expect(hintText(wrapper)).toContain('→ 子へ移動')
            expect(press(wrapper, 'ArrowRight')).toBe(false)
            await nextTick()
            expect(lastValue(wrapper)).toBe(prefix + path)
            expect(wrapper.find('.reference-token').exists()).toBe(false)
            expect(
              wrapper
                .get('button[data-selected="true"]')
                .attributes('aria-label')
            ).toBe(path)
            expect(document.activeElement).toBe(wrapper.vm.element)
          }

          expect(
            wrapper.emitted('update:modelValue')?.map(args => args[0])
          ).toEqual([
            prefix + text,
            prefix + '#team/SysAd',
            prefix + '#team/SysAd/Client'
          ])
          expect(wrapper.emitted('keydown')).toBeUndefined()
          expect(hintText(wrapper)).not.toContain('→')
          expect(press(wrapper, 'ArrowRight')).toBe(true)
          expect(lastValue(wrapper)).toBe(prefix + '#team/SysAd/Client')
          expect(wrapper.emitted('keydown')?.at(-1)?.[0]).toMatchObject({
            key: 'ArrowRight'
          })

          press(wrapper, 'z', { ctrlKey: true })
          await nextTick()
          expect(lastValue(wrapper)).toBe(prefix + '#team/SysAd')
          press(wrapper, 'z', { ctrlKey: true })
          await nextTick()
          expect(lastValue(wrapper)).toBe(prefix + text)
        }
      }
    )
  }
)

it.each([
  { shiftKey: true },
  { ctrlKey: true },
  { metaKey: true },
  { altKey: true }
])('leaves modified ArrowRight to caret navigation: %j', async modifier => {
  setBranchingChannelTree()
  const wrapper = await makeInput()
  await focus(wrapper)
  wrapper.vm.insertText('#t')
  await nextTick()

  expect(press(wrapper, 'ArrowRight', modifier)).toBe(true)
  expect(lastValue(wrapper)).toBe('#t')
  expect(wrapper.emitted('keydown')?.at(-1)?.[0]).toMatchObject({
    key: 'ArrowRight',
    ...modifier
  })
})

describe.each(['message', 'search'] as const)(
  'candidate navigation in %s mode',
  mode => {
    it.each([
      { key: 'Tab', shiftKey: false, backward: false },
      { key: 'Tab', shiftKey: true, backward: true },
      { key: 'ArrowDown', shiftKey: false, backward: false },
      { key: 'ArrowUp', shiftKey: false, backward: true }
    ])(
      'cycles candidates with $key (Shift: $shiftKey) and confirms with Enter',
      async ({ key, shiftKey, backward }) => {
        for (const markdown of [true, false]) {
          setBranchingChannelTree()
          const wrapper = await makeInput({ mode, suggestions: 'real' })
          await wrapper.setProps({ markdown })
          await focus(wrapper)
          const prefix = mode === 'search' ? 'in:' : ''
          const text = prefix + '#team'
          wrapper.vm.insertText(text)
          await nextTick()

          expect(wrapper.find('button[data-selected="true"]').exists()).toBe(
            false
          )

          for (const path of backward
            ? ['#team/SysDev', '#team/SysAd', '#team/SysDev']
            : ['#team/SysAd', '#team/SysDev', '#team/SysAd']) {
            expect(press(wrapper, key, { shiftKey })).toBe(false)
            await nextTick()

            expect(
              wrapper
                .get('button[data-selected="true"]')
                .attributes('aria-label')
            ).toBe(path)
            expect(lastValue(wrapper)).toBe(prefix + path)
            expect(wrapper.find('.reference-token').exists()).toBe(false)
            expect(getEditor(wrapper).state.selection.head).toBe(
              (prefix + path).length + 1
            )
            expect(
              wrapper
                .getComponent(DropdownSuggester)
                .props('candidates')
                ?.map((candidate: Candidate) => candidate.word.text)
            ).toEqual(['#team/SysAd', '#team/SysDev'])
            expect(document.activeElement).toBe(wrapper.vm.element)
          }

          expect(wrapper.emitted('keydown')).toBeUndefined()
          press(wrapper, 'Enter')
          await nextTick()

          expect(lastValue(wrapper)).toBe(
            encodeReference(
              mode === 'search'
                ? {
                    type: 'search-in',
                    id: backward ? 'sysdev' : 'sysad',
                    raw: prefix + (backward ? '#team/SysDev' : '#team/SysAd'),
                    kind: 'channel'
                  }
                : {
                    type: 'channel',
                    id: backward ? 'sysdev' : 'sysad',
                    raw: prefix + (backward ? '#team/SysDev' : '#team/SysAd')
                  }
            ) + ' '
          )
        }
      }
    )
  }
)

it.each(['message', 'search'] as const)(
  'confirms the current parent with Enter before selecting a child in %s mode',
  async mode => {
    setChannelTree()
    const wrapper = await makeInput({ mode })
    await focus(wrapper)
    const prefix = mode === 'search' ? 'in:' : ''
    wrapper.vm.insertText(`${prefix}#times`)
    await nextTick()
    press(wrapper, 'Enter')
    await nextTick()

    expect(lastValue(wrapper)).toBe(
      encodeReference(
        mode === 'search'
          ? {
              type: 'search-in',
              id: 'times',
              raw: prefix + '#times',
              kind: 'channel'
            }
          : { type: 'channel', id: 'times', raw: prefix + '#times' }
      ) + ' '
    )
    expect(wrapper.emitted('keydown')).toBeUndefined()
  }
)
