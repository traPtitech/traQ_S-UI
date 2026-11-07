import { nextTick } from 'vue'

import {
  embedded,
  focus,
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
