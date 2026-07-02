import useInsertTextWithoutSetup from '/@/composables/dom/useInsertText'

import { setupMatchMedia } from '../../mocks/matchMedia'
import { withSetup } from '../../testUtils'

const useInsertText = withSetup(useInsertTextWithoutSetup)

describe('useInsertText', () => {
  it('uses the non-mobile insertText path when matchMedia does not match', () => {
    setupMatchMedia(false)
    const textarea = document.createElement('textarea')
    textarea.value = 'before after'
    textarea.setSelectionRange(7, 12)
    document.body.appendChild(textarea)
    textarea.focus()
    const execCommand = vi.spyOn(document, 'execCommand')
    const [{ insertText }, { unmount }] = useInsertText(textarea)

    insertText('new')

    expect(execCommand).toHaveBeenCalledWith('insertText', false, 'new')
    expect(textarea.value).toBe('before new')
    unmount()
    textarea.remove()
  })

  it('uses the mobile insertText path when matchMedia matches', () => {
    setupMatchMedia(true)
    const textarea = document.createElement('textarea')
    textarea.value = 'before after'
    textarea.setSelectionRange(7, 12)
    const setRangeText = vi.spyOn(textarea, 'setRangeText')
    const onInput = vi.fn()
    textarea.addEventListener('input', onInput)
    const [{ insertText }, { unmount }] = useInsertText(textarea)

    insertText('new')

    expect(setRangeText).toHaveBeenCalledWith('new', 7, 12, 'end')
    expect(onInput).toHaveBeenCalledOnce()
    unmount()
    setupMatchMedia()
  })
})
