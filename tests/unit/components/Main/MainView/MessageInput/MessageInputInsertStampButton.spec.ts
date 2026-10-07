import { mount } from '@vue/test-utils'

import MessageInputInsertStampButton from '/@/components/Main/MainView/MessageInput/MessageInputInsertStampButton.vue'

describe('MessageInputInsertStampButton', () => {
  let textarea: HTMLTextAreaElement
  let container: HTMLDivElement

  beforeEach(() => {
    textarea = document.createElement('textarea')
    textarea.value = '変換中'
    container = document.createElement('div')
    document.body.append(textarea, container)
  })

  afterEach(() => {
    textarea.remove()
    container.remove()
  })

  it('prevents pointer focus changes and opens once on click during composition', () => {
    const onClick = vi.fn()
    const wrapper = mount(MessageInputInsertStampButton, {
      attachTo: container,
      attrs: { onClick },
      global: { stubs: { AIcon: true } }
    })
    textarea.focus()
    textarea.setSelectionRange(1, 3)
    textarea.dispatchEvent(new CompositionEvent('compositionstart'))
    const onBlur = vi.fn()
    textarea.addEventListener('blur', onBlur)
    const button = wrapper.get('button').element
    const mouseDown = new MouseEvent('mousedown', {
      button: 0,
      bubbles: true,
      cancelable: true
    })

    button.dispatchEvent(mouseDown)

    expect(mouseDown.defaultPrevented).toBe(true)
    expect(onClick).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(textarea)
    expect(textarea.selectionStart).toBe(1)
    expect(textarea.selectionEnd).toBe(3)
    expect(onBlur).not.toHaveBeenCalled()

    button.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }))

    expect(onClick).toHaveBeenCalledOnce()
    expect(document.activeElement).toBe(textarea)
    wrapper.unmount()
  })

  it('keeps keyboard and assistive activation available without mousedown', () => {
    const onClick = vi.fn()
    const wrapper = mount(MessageInputInsertStampButton, {
      attachTo: container,
      attrs: { onClick },
      global: { stubs: { AIcon: true } }
    })
    const button = wrapper.get('button').element
    button.focus()

    button.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 0 }))

    expect(onClick).toHaveBeenCalledOnce()
    expect(document.activeElement).toBe(button)
    wrapper.unmount()
  })

  it('does not cancel secondary button presses', () => {
    const wrapper = mount(MessageInputInsertStampButton, {
      attachTo: container,
      global: { stubs: { AIcon: true } }
    })
    const mouseDown = new MouseEvent('mousedown', {
      button: 2,
      bubbles: true,
      cancelable: true
    })

    wrapper.get('button').element.dispatchEvent(mouseDown)

    expect(mouseDown.defaultPrevented).toBe(false)
    wrapper.unmount()
  })
})
