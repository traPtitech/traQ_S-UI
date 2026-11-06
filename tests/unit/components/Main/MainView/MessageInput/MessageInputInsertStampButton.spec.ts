import { defineComponent, h, nextTick, ref } from 'vue'

import { mount } from '@vue/test-utils'

import MessageInputInsertStampButton from '/@/components/Main/MainView/MessageInput/MessageInputInsertStampButton.vue'
import ClickOutside from '/@/components/UI/ClickOutside'

vi.mock('/@/store/ui/modal', () => ({
  useModalStore: () => ({ shouldShowModal: ref(false) })
}))

const touchEvent = (type: string, init: Partial<PointerEvent> = {}) => {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX: 20,
    clientY: 20,
    ...init
  })
  Object.assign(event, {
    pointerId: init.pointerId ?? 1,
    pointerType: init.pointerType ?? 'touch',
    isPrimary: init.isPrimary ?? true
  })
  return event
}

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

  it('activates on touch release even if compatibility mouse events never arrive', () => {
    const onClick = vi.fn(() => textarea.blur())
    const wrapper = mount(MessageInputInsertStampButton, {
      attachTo: container,
      attrs: { onClick },
      global: { stubs: { AIcon: true } }
    })
    const button = wrapper.get('button').element
    vi.spyOn(button, 'getBoundingClientRect').mockReturnValue(
      new DOMRect(10, 10, 24, 24)
    )
    textarea.focus()
    textarea.dispatchEvent(new CompositionEvent('compositionstart'))

    button.dispatchEvent(touchEvent('pointerdown'))
    expect(onClick).not.toHaveBeenCalled()
    button.dispatchEvent(touchEvent('pointerup'))

    expect(onClick).toHaveBeenCalledOnce()
    expect(document.activeElement).not.toBe(textarea)

    button.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }))
    expect(onClick).toHaveBeenCalledOnce()

    button.dispatchEvent(touchEvent('pointerdown'))
    button.dispatchEvent(touchEvent('pointerup'))
    expect(onClick).toHaveBeenCalledTimes(2)
    wrapper.unmount()
  })

  it.each(['pointercancel', 'outside', 'secondary'])(
    'does not activate on a %s touch gesture',
    gesture => {
      const onClick = vi.fn()
      const wrapper = mount(MessageInputInsertStampButton, {
        attachTo: container,
        attrs: { onClick },
        global: { stubs: { AIcon: true } }
      })
      const button = wrapper.get('button').element
      vi.spyOn(button, 'getBoundingClientRect').mockReturnValue(
        new DOMRect(10, 10, 24, 24)
      )
      button.dispatchEvent(
        touchEvent('pointerdown', { isPrimary: gesture !== 'secondary' })
      )
      if (gesture === 'pointercancel') {
        button.dispatchEvent(touchEvent('pointercancel'))
      }
      button.dispatchEvent(
        touchEvent('pointerup', {
          clientX: gesture === 'outside' ? 100 : 20,
          isPrimary: gesture !== 'secondary'
        })
      )
      if (gesture === 'outside') {
        button.dispatchEvent(
          new MouseEvent('click', { bubbles: true, detail: 1 })
        )
      }

      expect(onClick).not.toHaveBeenCalled()
      wrapper.unmount()
    }
  )

  it('does not suppress keyboard activation after a tap without a click', () => {
    const onClick = vi.fn()
    const wrapper = mount(MessageInputInsertStampButton, {
      attachTo: container,
      attrs: { onClick },
      global: { stubs: { AIcon: true } }
    })
    const button = wrapper.get('button').element
    vi.spyOn(button, 'getBoundingClientRect').mockReturnValue(
      new DOMRect(10, 10, 24, 24)
    )
    button.dispatchEvent(touchEvent('pointerdown'))
    button.dispatchEvent(touchEvent('pointerup'))
    button.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 0 }))

    expect(onClick).toHaveBeenCalledTimes(2)
    wrapper.unmount()
  })

  it('does not activate a disabled button by touch or click', () => {
    const onClick = vi.fn()
    const wrapper = mount(MessageInputInsertStampButton, {
      attachTo: container,
      props: { disabled: true },
      attrs: { onClick },
      global: { stubs: { AIcon: true } }
    })
    const button = wrapper.get('button').element
    vi.spyOn(button, 'getBoundingClientRect').mockReturnValue(
      new DOMRect(10, 10, 24, 24)
    )

    button.dispatchEvent(touchEvent('pointerdown'))
    button.dispatchEvent(touchEvent('pointerup'))
    button.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }))

    expect(onClick).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('stays open after the opening touch and closes on an outside gesture', async () => {
    const shown = ref(false)
    const Harness = defineComponent(
      () => () =>
        h('div', [
          h(MessageInputInsertStampButton, {
            onClick: () => {
              textarea.blur()
              shown.value = !shown.value
            }
          }),
          shown.value
            ? h(
                ClickOutside,
                {
                  onClickOutside: () => {
                    shown.value = false
                  }
                },
                () => h('div', { 'data-testid': 'picker' }, 'picker')
              )
            : null
        ])
    )
    const wrapper = mount(Harness, {
      attachTo: container,
      global: { stubs: { AIcon: true } }
    })
    const button = wrapper.get('button').element
    vi.spyOn(button, 'getBoundingClientRect').mockReturnValue(
      new DOMRect(10, 10, 24, 24)
    )
    textarea.focus()
    button.dispatchEvent(touchEvent('pointerdown'))
    await nextTick()
    button.dispatchEvent(touchEvent('pointerup'))
    await nextTick()
    expect(wrapper.find('[data-testid="picker"]').exists()).toBe(true)
    button.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }))
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(wrapper.find('[data-testid="picker"]').exists()).toBe(true)
    expect(document.activeElement).not.toBe(textarea)

    textarea.dispatchEvent(touchEvent('pointerdown'))
    textarea.dispatchEvent(touchEvent('pointerup'))
    await new Promise(resolve => setTimeout(resolve, 10))
    await nextTick()
    expect(wrapper.find('[data-testid="picker"]').exists()).toBe(false)
    wrapper.unmount()
  })
})
