import { nextTick } from 'vue'

import DropdownSuggester from '/@/components/UI/DropdownSuggester/DropdownSuggester.vue'

import { focus, lastValue, makeInput, press } from './fixture'

await vi.hoisted(async () => {
  await import('./mocks')
})

it.each([
  [':te', ':test', ':test'],
  [':@al', '@alice', ':@alice'],
  [':test.la', '.large', ':test.large']
])(
  'continues %s from the effect action button',
  async (prefix, candidateText, completed) => {
    const wrapper = await makeInput()
    await focus(wrapper)
    wrapper.vm.insertText(prefix)
    await nextTick()
    const menu = wrapper.getComponent(DropdownSuggester)
    const candidate = menu
      .props('candidates')
      ?.find(candidate => candidate.word.text === candidateText)
    if (!candidate) throw new Error('Missing stamp candidate')
    expect(candidate.canAppendEffect).toBe(true)

    menu.vm.$emit('appendEffect', candidate.word)
    await nextTick()

    expect(lastValue(wrapper)).toBe(completed + '.')
    expect(menu.props('isShown')).toBe(true)
    expect(menu.props('candidates')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          word: { type: 'stamp-effect', text: '.rotate' },
          canAppendEffect: true
        })
      ])
    )
  }
)

it('does not offer the effect action for regular mentions or search', async () => {
  for (const mode of ['message', 'search'] as const) {
    const wrapper = await makeInput('', mode)
    await focus(wrapper)
    wrapper.vm.insertText(mode === 'message' ? '@al' : 'from:al')
    await nextTick()
    const candidates = wrapper
      .getComponent(DropdownSuggester)
      .props('candidates')
    expect(candidates?.length).toBeGreaterThan(0)
    expect(candidates?.some(candidate => candidate.canAppendEffect)).toBe(false)
  }
})

it('keeps the animation limit when continuing from the effect button', async () => {
  const wrapper = await makeInput()
  await focus(wrapper)
  const prefix = ':test.atsumori.atsumori.conga.flashy'
  wrapper.vm.insertText(prefix + '.atsu')
  await nextTick()
  const menu = wrapper.getComponent(DropdownSuggester)
  const candidate = menu.props('candidates')?.[0]
  if (!candidate) throw new Error('Missing fifth animation candidate')

  menu.vm.$emit('appendEffect', candidate.word)
  await nextTick()

  expect(lastValue(wrapper)).toBe(prefix + '.atsumori.')
  expect(
    menu
      .props('candidates')
      ?.map(candidate => candidate.word.text)
      .sort()
  ).toEqual(['.ex-large', '.large', '.small'])
})

it.each([
  [':te', ':test'],
  [':@al', ':@alice'],
  [':test.la', ':test.large']
])(
  'completes %s with dot and opens the next effect candidates',
  async (prefix, completed) => {
    const wrapper = await makeInput()
    await focus(wrapper)
    wrapper.vm.insertText(prefix)
    await nextTick()

    expect(press(wrapper, '.')).toBe(false)
    await nextTick()
    expect(lastValue(wrapper)).toBe(completed + '.')
    const menu = wrapper.getComponent(DropdownSuggester)
    expect(menu.props('isShown')).toBe(true)
    expect(menu.props('candidates')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          word: { type: 'stamp-effect', text: '.large' }
        }),
        expect.objectContaining({
          word: { type: 'stamp-effect', text: '.rotate' }
        })
      ])
    )

    wrapper.vm.insertText('sm')
    await nextTick()
    press(wrapper, 'Tab')
    await nextTick()
    expect(lastValue(wrapper)).toBe(completed + '.small')
    press(wrapper, 'Enter')
    await nextTick()
    expect(lastValue(wrapper)).toBe(completed + '.small: ')
    expect(menu.props('isShown')).toBe(false)
    expect(wrapper.find('.reference-token').exists()).toBe(false)
  }
)

it('appends an effect to the selected stamp after cycling, with independent undo', async () => {
  const wrapper = await makeInput()
  await focus(wrapper)
  wrapper.vm.insertText(':te')
  await nextTick()
  press(wrapper, 'Tab')
  await nextTick()
  press(wrapper, 'Tab')
  await nextTick()
  expect(lastValue(wrapper)).toBe(':testing')

  press(wrapper, '.')
  await nextTick()
  expect(lastValue(wrapper)).toBe(':testing.')
  press(wrapper, 'z', { ctrlKey: true })
  await nextTick()
  expect(lastValue(wrapper)).toBe(':testing')
  press(wrapper, 'y', { ctrlKey: true })
  await nextTick()
  expect(lastValue(wrapper)).toBe(':testing.')
  expect(wrapper.getComponent(DropdownSuggester).props('isShown')).toBe(true)
})

it.each(['Enter', 'Tab', 'click'])(
  'closes user icons and effects on %s confirmation',
  async confirmation => {
    for (const [prefix, completed] of [
      [':@al', ':@alice'],
      [':test.la', ':test.large'],
      [':@alice.la', ':@alice.large']
    ] as const) {
      const wrapper = await makeInput()
      await focus(wrapper)
      wrapper.vm.insertText(prefix)
      await nextTick()
      const menu = wrapper.getComponent(DropdownSuggester)

      if (confirmation === 'click') {
        menu.vm.$emit('select', menu.props('candidates')?.[0]?.word)
      } else {
        press(wrapper, 'Tab')
        await nextTick()
        expect(lastValue(wrapper)).toBe(completed)
        press(wrapper, confirmation)
      }

      await nextTick()
      expect(lastValue(wrapper)).toBe(completed + ': ')
      expect(menu.props('isShown')).toBe(false)
    }
  }
)

it('allows the fifth animation and offers only sizes when continuing with dot', async () => {
  const wrapper = await makeInput()
  await focus(wrapper)
  const prefix = ':test.atsumori.atsumori.conga.flashy'
  wrapper.vm.insertText(prefix + '.atsu')
  await nextTick()

  press(wrapper, 'Tab')
  await nextTick()
  expect(lastValue(wrapper)).toBe(prefix + '.atsumori')
  press(wrapper, '.')
  await nextTick()
  expect(lastValue(wrapper)).toBe(prefix + '.atsumori.')

  const menu = wrapper.getComponent(DropdownSuggester)
  expect(
    menu
      .props('candidates')
      ?.map(candidate => candidate.word.text)
      .sort()
  ).toEqual(['.ex-large', '.large', '.small'])

  wrapper.vm.insertText('sm')
  await nextTick()
  press(wrapper, 'Enter')
  await nextTick()
  expect(lastValue(wrapper)).toBe(prefix + '.atsumori.small: ')
})

it('does not show a sixth animation after typing its prefix', async () => {
  const wrapper = await makeInput()
  await focus(wrapper)
  const text = ':test.atsumori.atsumori.conga.flashy.atsumori.ro'
  wrapper.vm.insertText(text)
  await nextTick()
  expect(wrapper.getComponent(DropdownSuggester).props('isShown')).toBe(false)
  expect(lastValue(wrapper)).toBe(text)
})

it.each(['@al', '#te', 'text.'])(
  'does not consume dot as stamp completion in %s',
  async text => {
    const wrapper = await makeInput()
    await focus(wrapper)
    wrapper.vm.insertText(text)
    await nextTick()
    expect(press(wrapper, '.')).toBe(true)
    expect(lastValue(wrapper)).toBe(text)
  }
)
