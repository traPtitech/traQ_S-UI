import usePaste from '/@/composables/messageComposer/usePaste'
import { REFERENCE_CLIPBOARD_TYPE } from '/@/lib/referenceInput/clipboard'
import { encodeReference } from '/@/lib/references'

import {
  embedded,
  focus,
  getEditor,
  installReferenceInputFixture,
  lastValue,
  makeInput,
  press,
  setChannelTree
} from './fixture'

await vi.hoisted(async () => {
  await import('./mocks')
})

installReferenceInputFixture()

it.each([
  { text: '', expected: 'hello' },
  { text: 'image caption', expected: 'himage captiono' }
])(
  'preserves the selected text for a file-only paste: $text',
  async ({ text, expected }) => {
    const wrapper = await makeInput({ source: 'hello' })
    const emit = vi.fn()
    await wrapper.setProps({ preparePaste: usePaste(emit).preparePaste })
    await focus(wrapper)

    const editor = getEditor(wrapper)
    editor.commands.setTextSelection({ from: 2, to: 5 })

    const file = new File(['png'], 'image.png', { type: 'image/png' })
    const event = new Event('paste', { bubbles: true, cancelable: true })

    Object.defineProperty(event, 'clipboardData', {
      value: {
        types: text ? ['Files', 'text/plain'] : ['Files'],
        files: [file],
        getData: (type: string) => (type === 'text/plain' ? text : '')
      }
    })

    wrapper.vm.element?.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(true)
    expect(emit).toHaveBeenCalledExactlyOnceWith('addAttachments', [file])
    expect(editor.state.doc.textContent).toBe(expected)
  }
)

const copiedChannelLink = () =>
  `[#times/25/person](${location.origin}/channels/times/25/person)`

const pasteText = (
  wrapper: Awaited<ReturnType<typeof makeInput>>,
  text: string
) => {
  const event = new Event('paste', { bubbles: true, cancelable: true })

  Object.defineProperty(event, 'clipboardData', {
    value: { getData: (type: string) => (type === 'text/plain' ? text : '') }
  })

  wrapper.vm.element?.dispatchEvent(event)
}

it('preserves the selection when asynchronous clipboard conversion has no text', async () => {
  const wrapper = await makeInput({ source: 'hello' })
  await wrapper.setProps({
    preparePaste: () => ({ type: 'text', text: Promise.resolve('') })
  })
  await focus(wrapper)
  const editor = getEditor(wrapper)
  editor.commands.setTextSelection({ from: 2, to: 5 })
  pasteText(wrapper, '')

  await Promise.resolve()
  expect(editor.state.doc.textContent).toBe('hello')
  expect(editor.state.selection).toMatchObject({ from: 2, to: 5 })
})

it.each([false, true])(
  'pastes copied channel links as references with Markdown %s and supports Undo',
  async markdown => {
    setChannelTree()
    const wrapper = await makeInput({ source: 'before replace after' })
    await wrapper.setProps({ markdown })
    await focus(wrapper)

    const editor = getEditor(wrapper)
    editor.commands.setTextSelection({ from: 8, to: 15 })
    pasteText(wrapper, copiedChannelLink())

    const reference = encodeReference({
      type: 'channel',
      id: 'person',
      raw: '#times/25/person'
    })

    expect(lastValue(wrapper)).toBe(`before ${reference} after`)
    expect(wrapper.find('.reference-token').text()).toBe('#times/25/person')

    press(wrapper, 'z', { ctrlKey: true })
    expect(lastValue(wrapper)).toBe('before replace after')
    expect(wrapper.find('.reference-token').exists()).toBe(false)

    press(wrapper, 'y', { ctrlKey: true })
    expect(lastValue(wrapper)).toBe(`before ${reference} after`)
  }
)

it('preserves the copied Markdown when pasted into an existing code span', async () => {
  setChannelTree()
  const wrapper = await makeInput({ source: '`before  after`' })
  await focus(wrapper)

  getEditor(wrapper).commands.setTextSelection(9)

  pasteText(wrapper, copiedChannelLink())

  expect(lastValue(wrapper)).toBe('`before ' + copiedChannelLink() + ' after`')
  expect(wrapper.find('.reference-token').exists()).toBe(false)
})

it('keeps links from other servers as ordinary Markdown', async () => {
  setChannelTree()
  const wrapper = await makeInput()
  await focus(wrapper)

  const text = copiedChannelLink().replace(
    location.origin,
    'https://other.example'
  )

  pasteText(wrapper, text)

  expect(lastValue(wrapper)).toBe(text)
  expect(wrapper.find('.reference-token').exists()).toBe(false)
})

it('keeps copied channel Markdown as plain text in search input', async () => {
  setChannelTree()
  const wrapper = await makeInput({ mode: 'search' })
  await focus(wrapper)
  pasteText(wrapper, copiedChannelLink())

  expect(lastValue(wrapper)).toBe(copiedChannelLink())
  expect(wrapper.find('.reference-token').exists()).toBe(false)
})

it('copies plain labels and restores IDs only from structured data from this server', async () => {
  const wrapper = await makeInput({ source: embedded })
  await focus(wrapper)
  press(wrapper, 'a', { ctrlKey: true })
  const data = new Map<string, string>()
  const copy = new Event('copy', { bubbles: true, cancelable: true })

  Object.defineProperty(copy, 'clipboardData', {
    value: { setData: (type: string, value: string) => data.set(type, value) }
  })

  wrapper.vm.element?.dispatchEvent(copy)

  expect(data.get('text/plain')).toBe('@alice')
  expect(data.get(REFERENCE_CLIPBOARD_TYPE)).toContain('original-id')

  const target = await makeInput()
  await focus(target)
  const paste = new Event('paste', { bubbles: true, cancelable: true })

  Object.defineProperty(paste, 'clipboardData', {
    value: { getData: (type: string) => data.get(type) ?? '' }
  })

  target.vm.element?.dispatchEvent(paste)

  expect(lastValue(target)).toBe(embedded)
})
