import { nextTick } from 'vue'

import { mount } from '@vue/test-utils'

import CommandPalette from '/@/components/Main/CommandPalette/CommandPalette.vue'
import CommandPaletteContainer from '/@/components/Main/CommandPalette/CommandPaletteContainer.vue'
import ReferenceInput from '/@/components/UI/ReferenceInput.vue'
import { encodeReference } from '/@/lib/references'
import { useCommandPalette } from '/@/store/app/commandPalette'

import {
  focus,
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

it.each(['mouse', 'touch'])(
  'keeps the command palette open while completing a channel with %s',
  async pointerType => {
    setChannelTree()
    const { presentation, currentInput } = useCommandPalette()
    currentInput.value = ''
    presentation.value = { mode: 'search', focusTarget: 'input' }
    const popup = document.createElement('div')
    popup.id = 'dropdown-suggester-popup'
    document.body.append(popup)

    const palette = mount(CommandPaletteContainer, {
      attachTo: document.body,

      global: {
        stubs: { SearchResult: true, SearchSuggestion: true },

        config: {
          globalProperties: {
            $boolAttr: (value: boolean) => (value ? '' : null)
          }
        }
      }
    })

    const activate = async (element: Element) => {
      for (const type of ['pointerdown', 'pointerup'])
        element.dispatchEvent(
          new PointerEvent(type, {
            bubbles: true,
            pointerType,
            pointerId: 1,
            buttons: type === 'pointerdown' ? 1 : 0
          })
        )

      element.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 0))
      await nextTick()
    }

    try {
      await nextTick()
      const input = palette.getComponent(ReferenceInput)
      await vi.waitFor(() => expect(input.vm.element?.isConnected).toBe(true))
      input.vm.element?.focus()
      await nextTick()
      input.vm.insertText('in:#ti')
      await nextTick()
      await nextTick()

      press(input, 'Tab')
      press(input, 'Tab', { shiftKey: true })
      await nextTick()

      expect(currentInput.value).toBe('in:#times')
      expect(palette.findComponent(CommandPalette).exists()).toBe(true)
      expect(document.activeElement).toBe(input.vm.element)

      const continueButton = document.querySelector(
        'button[aria-label="#times の子チャンネルを補完"]'
      )

      expect(continueButton).not.toBeNull()

      if (!continueButton) throw new Error('Missing channel completion')

      await activate(continueButton)

      expect(palette.findComponent(CommandPalette).exists()).toBe(true)
      expect(currentInput.value).toBe('in:#times')

      const channel = document.querySelector('button[aria-label="#times/25"]')

      expect(channel).not.toBeNull()

      if (!channel) throw new Error('Missing child channel')

      await activate(channel)

      expect(palette.findComponent(CommandPalette).exists()).toBe(true)

      expect(currentInput.value).toBe(
        encodeReference({
          type: 'search-in',
          id: 'year25',
          raw: 'in:#times/25',
          kind: 'channel'
        }) + ' '
      )

      await activate(document.body)

      expect(palette.findComponent(CommandPalette).exists()).toBe(false)
    } finally {
      palette.unmount()
      popup.remove()
      presentation.value = undefined
    }
  }
)

it('creates a selected search condition with its ID', async () => {
  const wrapper = await makeInput('', 'search')
  await focus(wrapper)
  wrapper.vm.insertText('from:al')
  await nextTick()
  press(wrapper, 'Enter')

  expect(lastValue(wrapper)).toBe(
    encodeReference({
      type: 'search-from',
      id: 'original-id',
      raw: 'from:@alice',
      kind: 'user'
    }) + ' '
  )
})
