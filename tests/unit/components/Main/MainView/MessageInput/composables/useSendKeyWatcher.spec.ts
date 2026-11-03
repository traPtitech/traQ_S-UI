import { nextTick, ref } from 'vue'

import useSendKeyWatcher from '/@/components/Main/MainView/MessageInput/composables/useSendKeyWatcher'
import { useBrowserSettings } from '/@/store/app/browserSettings'

import { withSetup } from '../../../../../testUtils'

vi.mock('/@/lib/dom/browser', () => ({
  checkLevel2InputEventsSupport: () => true,
  isMac: () => false,
  isTouchDevice: () => false
}))

vi.mock('/@/store/app/browserSettings', async () => {
  const { ref } = await import('vue')
  const sendWithModifierKey = ref('modifier')

  const modifierKey = ref({
    ctrl: true,
    alt: false,
    shift: true,
    macCtrl: false
  })

  return { useBrowserSettings: () => ({ sendWithModifierKey, modifierKey }) }
})

const cleanups: Array<() => void> = []

const setup = (enabled = true) => {
  const markdown = ref(enabled)
  const emit = vi.fn()
  const lineBreak = vi.fn()

  const [watcher, component] = withSetup(useSendKeyWatcher)(
    emit,
    lineBreak,
    true,
    markdown
  )

  cleanups.push(component.unmount)

  return { watcher, markdown, emit, lineBreak }
}

beforeEach(() => {
  useBrowserSettings().sendWithModifierKey.value = 'modifier'

  useBrowserSettings().modifierKey.value = {
    ctrl: true,
    alt: false,
    shift: true,
    macCtrl: false
  }
})

afterEach(() => cleanups.splice(0).forEach(cleanup => cleanup()))

describe('Markdown send key handling', () => {
  it.each(['modifier', 'none'] as const)(
    'keeps Shift+Enter for editing with %s send mode when Shift is unassigned',
    mode => {
      useBrowserSettings().sendWithModifierKey.value = mode
      useBrowserSettings().modifierKey.value.shift = false
      const { watcher, emit, lineBreak } = setup()
      const event = new KeyboardEvent('keydown', {
        key: 'Enter',
        shiftKey: true,
        cancelable: true
      })
      watcher.onKeyDown(event)

      expect(event.defaultPrevented).toBe(true)
      expect(emit).not.toHaveBeenCalledWith('postMessage')
      expect(lineBreak).toHaveBeenCalledOnce()
      expect(lineBreak).toHaveBeenLastCalledWith({ continueItem: true })
    }
  )

  it.each([false, true])(
    'keeps the configured Shift send shortcut with Markdown %s',
    markdown => {
      useBrowserSettings().modifierKey.value.ctrl = false
      const { watcher, emit, lineBreak } = setup(markdown)

      watcher.onKeyDown(
        new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true })
      )

      expect(emit).toHaveBeenCalledWith('postMessage')
      expect(lineBreak).not.toHaveBeenCalled()
    }
  )

  it('keeps Ctrl+Enter available for sending in modifier send mode', () => {
    const { watcher, emit } = setup()

    watcher.onKeyDown(
      new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true })
    )

    expect(emit).toHaveBeenCalledWith('postMessage')
  })

  it('keeps Enter for sending and Ctrl+Enter for a new item in Enter send mode', () => {
    useBrowserSettings().sendWithModifierKey.value = 'none'
    const { watcher, emit, lineBreak } = setup()

    watcher.onKeyDown(
      new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true })
    )

    expect(lineBreak).toHaveBeenCalledOnce()
    expect(lineBreak).toHaveBeenCalledWith()
    expect(emit).not.toHaveBeenCalledWith('postMessage')

    watcher.onKeyDown(new KeyboardEvent('keydown', { key: 'Enter' }))
    expect(emit).toHaveBeenCalledWith('postMessage')
  })

  it('does not submit a soft line break without keydown in Markdown mode', () => {
    useBrowserSettings().sendWithModifierKey.value = 'none'
    const { watcher, emit } = setup()

    const event = new InputEvent('beforeinput', {
      inputType: 'insertLineBreak',
      cancelable: true
    })

    watcher.onBeforeInput(event)

    expect(event.defaultPrevented).toBe(false)
    expect(emit).not.toHaveBeenCalledWith('postMessage')

    watcher.onBeforeInput(
      new InputEvent('beforeinput', { inputType: 'insertParagraph' })
    )

    expect(emit).toHaveBeenCalledWith('postMessage')
  })

  it('clears the held modifier hint on mode change without changing stored settings', async () => {
    const { watcher, markdown, emit } = setup(false)

    watcher.onKeyDown(
      new KeyboardEvent('keydown', { key: 'Shift', shiftKey: true })
    )

    expect(emit).toHaveBeenCalledWith('modifierKeyDown')
    emit.mockClear()
    markdown.value = true
    await nextTick()

    expect(emit).toHaveBeenCalledWith('modifierKeyUp')
    expect(useBrowserSettings().modifierKey.value.shift).toBe(true)
    emit.mockClear()

    watcher.onKeyDown(
      new KeyboardEvent('keydown', { key: 'Shift', shiftKey: true })
    )

    expect(emit).toHaveBeenCalledWith('modifierKeyDown')
  })

  it('leaves IME confirmation untouched', () => {
    const { watcher, emit, lineBreak } = setup()

    const event = new KeyboardEvent('keydown', {
      key: 'Enter',
      shiftKey: true,
      isComposing: true,
      cancelable: true
    })

    watcher.onKeyDown(event)

    expect(event.defaultPrevented).toBe(false)
    expect(emit).not.toHaveBeenCalled()
    expect(lineBreak).not.toHaveBeenCalled()
  })
})
