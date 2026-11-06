import { nextTick, shallowRef } from 'vue'

import useInsertTextWithoutSetup from '/@/composables/dom/useInsertText'
import { isWebKit, shouldAutoFocus } from '/@/lib/dom/browser'

import { setupMatchMedia } from '../../mocks/matchMedia'
import { withSetup } from '../../testUtils'

vi.mock('/@/lib/dom/browser', () => ({
  isWebKit: vi.fn(() => false),
  shouldAutoFocus: vi.fn(() => true)
}))

const useInsertText = withSetup(useInsertTextWithoutSetup)

describe('useInsertText', () => {
  let textarea: HTMLTextAreaElement
  let button: HTMLButtonElement
  let unmount: (() => void) | undefined

  beforeEach(() => {
    vi.mocked(isWebKit).mockReturnValue(false)
    vi.mocked(shouldAutoFocus).mockReturnValue(true)
    vi.useFakeTimers({ toFake: ['requestAnimationFrame'] })
    textarea = document.createElement('textarea')
    textarea.value = 'before after'
    textarea.setSelectionRange(7, 12)
    button = document.createElement('button')
    document.body.append(textarea, button)
  })

  afterEach(() => {
    unmount?.()
    unmount = undefined
    vi.useRealTimers()
    vi.restoreAllMocks()
    textarea.remove()
    button.remove()
    setupMatchMedia()
  })

  const setup = async (
    target = shallowRef(textarea),
    range = shallowRef({ begin: 7, end: 12 })
  ) => {
    const [result, cleanup] = useInsertText(target, range)
    unmount = cleanup.unmount
    await nextTick()
    return result
  }

  it.each([true, false])(
    'uses native insertion on a focused desktop regardless of viewport match %s',
    async narrow => {
      setupMatchMedia(narrow)
      textarea.focus()
      const execCommand = vi.spyOn(document, 'execCommand')
      const { insertText } = await setup()

      insertText('new')

      expect(execCommand).toHaveBeenCalledWith('insertText', false, 'new')
      expect(textarea.value).toBe('before new')
    }
  )

  it('uses native insertion on an already-focused touch device', async () => {
    vi.mocked(shouldAutoFocus).mockReturnValue(false)
    textarea.focus()
    const execCommand = vi.spyOn(document, 'execCommand')
    const onBlur = vi.fn()
    textarea.addEventListener('blur', onBlur)
    const { insertText } = await setup()

    insertText('new')

    expect(execCommand).toHaveBeenCalledWith('insertText', false, 'new')
    expect(textarea.value).toBe('before new')
    expect(document.activeElement).toBe(textarea)
    expect(onBlur).not.toHaveBeenCalled()
  })

  it('inserts on an unfocused touch device without moving focus', async () => {
    vi.mocked(shouldAutoFocus).mockReturnValue(false)
    button.focus()
    const onFocus = vi.fn()
    const onInput = vi.fn()
    textarea.addEventListener('focus', onFocus)
    textarea.addEventListener('input', onInput)
    const { insertText } = await setup()

    insertText('new')
    vi.advanceTimersToNextFrame()

    expect(textarea.value).toBe('before new')
    expect(textarea.selectionStart).toBe(10)
    expect(textarea.selectionEnd).toBe(10)
    expect(onInput).toHaveBeenCalledOnce()
    expect(onFocus).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(button)
  })

  it('avoids execCommand until IME composition ends', async () => {
    textarea.value = 'before #gene'
    textarea.focus()
    const execCommand = vi.spyOn(document, 'execCommand')
    const range = shallowRef({ begin: 7, end: 12 })
    const { insertText } = await setup(shallowRef(textarea), range)
    textarea.dispatchEvent(new CompositionEvent('compositionstart'))

    insertText('#general')

    expect(execCommand).not.toHaveBeenCalled()
    expect(textarea.value).toBe('before #general')

    range.value = { begin: 7, end: 15 }
    insertText('#general')
    expect(execCommand).not.toHaveBeenCalled()
    expect(textarea.value).toBe('before #general')
    textarea.dispatchEvent(new CompositionEvent('compositionend'))
    textarea.value = 'before after'
    range.value = { begin: 7, end: 12 }
    insertText('new')
    expect(execCommand).toHaveBeenCalledWith('insertText', false, 'new')
    expect(textarea.value).toBe('before new')
  })

  it('recognizes composing input even without compositionstart', async () => {
    textarea.focus()
    const execCommand = vi.spyOn(document, 'execCommand')
    const { insertText } = await setup()
    textarea.dispatchEvent(new InputEvent('input', { isComposing: true }))

    insertText('new')

    expect(execCommand).not.toHaveBeenCalled()
    expect(textarea.value).toBe('before new')
  })

  it('uses native editing on composing WebKit and propagates subsequent input', async () => {
    vi.mocked(isWebKit).mockReturnValue(true)
    vi.mocked(shouldAutoFocus).mockReturnValue(false)
    textarea.value = 'before :oyo'
    textarea.focus()
    const execCommand = vi.spyOn(document, 'execCommand')
    const range = shallowRef({ begin: 7, end: 11 })
    const { insertText } = await setup(shallowRef(textarea), range)
    let model = textarea.value
    textarea.addEventListener('input', () => {
      model = textarea.value
    })
    textarea.dispatchEvent(new CompositionEvent('compositionstart'))

    insertText(':oyoo: ')
    expect(execCommand).toHaveBeenCalledWith('insertText', false, ':oyoo: ')
    expect(model).toBe('before :oyoo: ')

    textarea.setRangeText(
      'next',
      textarea.selectionEnd,
      textarea.selectionEnd,
      'end'
    )
    textarea.dispatchEvent(new InputEvent('input', { isComposing: true }))

    expect(model).toBe('before :oyoo: next')
    expect(document.activeElement).toBe(textarea)
  })

  it('resets composition tracking when the textarea changes', async () => {
    const target = shallowRef(textarea)
    const { insertText } = await setup(target)
    textarea.dispatchEvent(new CompositionEvent('compositionstart'))
    const replacement = document.createElement('textarea')
    replacement.value = 'before after'
    document.body.appendChild(replacement)
    target.value = replacement
    await nextTick()
    replacement.focus()
    const execCommand = vi.spyOn(document, 'execCommand')

    insertText('new')

    expect(execCommand).toHaveBeenCalledWith('insertText', false, 'new')
    expect(replacement.value).toBe('before new')
    replacement.remove()
  })
})
