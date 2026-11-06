import { nextTick } from 'vue'

import {
  embedded,
  focus,
  getEditor,
  installReferenceInputFixture,
  lastValue,
  makeInput,
  press
} from './fixture'

await vi.hoisted(async () => {
  vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
    'Mozilla/5.0 (iPad; CPU OS 18_5 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1'
  )
  vi.spyOn(navigator, 'vendor', 'get').mockReturnValue('Apple Computer, Inc.')
  await import('./mocks')
})

installReferenceInputFixture()

afterEach(() => vi.useRealTimers())

const beforeEnter = (wrapper: Awaited<ReturnType<typeof makeInput>>) => {
  const event = new InputEvent('beforeinput', {
    inputType: 'insertParagraph',
    bubbles: true,
    cancelable: true
  })
  wrapper.vm.element?.dispatchEvent(event)

  return event
}

const releaseEnter = (wrapper: Awaited<ReturnType<typeof makeInput>>) =>
  wrapper.vm.element?.dispatchEvent(
    new KeyboardEvent('keyup', { key: 'Enter', bubbles: true })
  )

it('inserts one newline per iOS Enter, including after the delayed fallback', async () => {
  const wrapper = await makeInput({ source: 'hello' })
  await focus(wrapper)
  getEditor(wrapper).commands.setTextSelection(6)
  vi.useFakeTimers()

  for (let count = 1; count <= 2; count++) {
    // Keep the native keydown action so the software keyboard can emit beforeinput.
    expect(press(wrapper, 'Enter', { keyCode: 13 })).toBe(true)
    expect(beforeEnter(wrapper).defaultPrevented).toBe(true)
    releaseEnter(wrapper)
    await vi.advanceTimersByTimeAsync(250)

    expect(lastValue(wrapper)).toBe('hello' + '\n'.repeat(count))
    expect(wrapper.emitted('keydown')).toHaveLength(count)
  }
})

it('handles a software keyboard newline without a keydown', async () => {
  const wrapper = await makeInput()
  await focus(wrapper)
  vi.useFakeTimers()

  beforeEnter(wrapper)
  await vi.advanceTimersByTimeAsync(250)

  expect(lastValue(wrapper)).toBe('\n')
  expect(wrapper.emitted('keydown')).toBeUndefined()
})

it('uses the current DOM selection before selectionchange is delivered', async () => {
  const wrapper = await makeInput({ source: 'hello' })
  await focus(wrapper)
  const editor = getEditor(wrapper)

  editor.commands.setTextSelection(6)
  const text = editor.view.dom.querySelector('p')?.firstChild
  if (!(text instanceof Text)) throw new Error('Missing text')
  document.getSelection()?.setBaseAndExtent(text, 1, text, 4)
  vi.useFakeTimers()

  press(wrapper, 'Enter', { keyCode: 13 })
  beforeEnter(wrapper)
  releaseEnter(wrapper)
  await vi.advanceTimersByTimeAsync(250)

  expect(lastValue(wrapper)).toBe('h\no')
})

it('confirms a suggestion without a delayed newline or parent key action', async () => {
  const wrapper = await makeInput()
  await focus(wrapper)
  wrapper.vm.insertText('@al')
  await nextTick()
  vi.useFakeTimers()

  press(wrapper, 'Enter', { keyCode: 13 })
  beforeEnter(wrapper)
  releaseEnter(wrapper)
  await vi.advanceTimersByTimeAsync(250)

  expect(lastValue(wrapper)).toBe(embedded + ' ')
  expect(wrapper.emitted('keydown')).toBeUndefined()
})

it('lets the search parent handle Enter once and discards the consumed key', async () => {
  const wrapper = await makeInput({ source: 'query', mode: 'search' })
  const onKeydown = vi.fn((event: KeyboardEvent) => event.preventDefault())
  await wrapper.setProps({ onKeydown })
  await focus(wrapper)
  vi.useFakeTimers()

  press(wrapper, 'Enter', { keyCode: 13 })
  beforeEnter(wrapper)
  releaseEnter(wrapper)
  await vi.advanceTimersByTimeAsync(250)
  beforeEnter(wrapper)
  await vi.advanceTimersByTimeAsync(250)

  expect(onKeydown).toHaveBeenCalledTimes(1)
  expect(lastValue(wrapper)).toBeUndefined()
})

it('preserves modified Enter shortcuts on an iPad hardware keyboard', async () => {
  const wrapper = await makeInput()
  const onKeydown = vi.fn((event: KeyboardEvent) => event.preventDefault())
  await wrapper.setProps({ onKeydown })
  await focus(wrapper)

  expect(press(wrapper, 'Enter', { keyCode: 13, ctrlKey: true })).toBe(false)
  expect(onKeydown).toHaveBeenCalledOnce()
  expect(onKeydown.mock.calls[0]?.[0].ctrlKey).toBe(true)
  expect(lastValue(wrapper)).toBeUndefined()
})

it('does not treat an IME confirmation as an iOS Enter action', async () => {
  const wrapper = await makeInput()
  await focus(wrapper)
  vi.useFakeTimers()
  wrapper.vm.element?.dispatchEvent(
    new CompositionEvent('compositionstart', { bubbles: true })
  )

  press(wrapper, 'Enter', { keyCode: 13, isComposing: true })
  beforeEnter(wrapper)
  releaseEnter(wrapper)
  await vi.advanceTimersByTimeAsync(250)

  expect(lastValue(wrapper)).toBeUndefined()
  expect(wrapper.emitted('keydown')).toBeUndefined()
  wrapper.vm.element?.dispatchEvent(
    new CompositionEvent('compositionend', { bubbles: true })
  )
  await vi.advanceTimersByTimeAsync(1)
})
