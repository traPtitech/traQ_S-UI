import { nextTick } from 'vue'

import { EditorContent } from '@tiptap/vue-3'

import DropdownSuggester from '/@/components/UI/DropdownSuggester/DropdownSuggester.vue'
import { useUsersStore } from '/@/store/entities/users'

import { createUser } from '../../fixtures/entities'
import {
  embedded,
  focus,
  installReferenceInputFixture,
  lastValue,
  makeInput,
  press
} from './fixture'

await vi.hoisted(async () => {
  await import('./mocks')
})

installReferenceInputFixture()

it('uses the native caret when software Backspace precedes selectionchange', async () => {
  const wrapper = await makeInput({ source: embedded + 'abc' })
  await focus(wrapper)

  const editor = wrapper.getComponent(EditorContent).props('editor')
  if (!editor) throw new Error('Editor is not mounted')

  editor.commands.setTextSelection(2)
  const text = editor.view.dom.querySelector('p')?.lastChild
  if (!(text instanceof Text)) throw new Error('Missing text')

  document.getSelection()?.setBaseAndExtent(text, 3, text, 3)

  const event = new InputEvent('beforeinput', {
    inputType: 'deleteContentBackward',
    bubbles: true,
    cancelable: true
  })

  wrapper.vm.element?.dispatchEvent(event)

  expect(event.defaultPrevented).toBe(false)
  expect(wrapper.find('.reference-token').exists()).toBe(true)
  expect(editor.state.selection.head).toBe(5)
  expect(lastValue(wrapper)).toBeUndefined()
})

it.each(['message', 'search'] as const)(
  'does not dispatch transactions while an idle %s input is mounted',
  async mode => {
    const wrapper = await makeInput({ mode })
    const editor = wrapper.getComponent(EditorContent).props('editor')
    if (!editor) throw new Error('Editor is not mounted')

    await new Promise(resolve => setTimeout(resolve, 80))
    const dispatch = vi.spyOn(editor.view, 'dispatch')

    await new Promise(resolve => setTimeout(resolve, 160))

    expect(dispatch).not.toHaveBeenCalled()
  }
)

it('reopens a reference for a software keyboard Backspace without keydown', async () => {
  const wrapper = await makeInput({ source: embedded })
  await focus(wrapper)

  wrapper
    .findComponent(EditorContent)
    .props('editor')
    ?.commands.setTextSelection(2)

  const event = new InputEvent('beforeinput', {
    inputType: 'deleteContentBackward',
    bubbles: true,
    cancelable: true
  })

  wrapper.vm.element?.dispatchEvent(event)
  await nextTick()

  expect(event.defaultPrevented).toBe(true)
  expect(lastValue(wrapper)).toBe('@alice')
  expect(wrapper.findComponent(DropdownSuggester).props('isShown')).toBe(true)

  press(wrapper, 'z', { ctrlKey: true })

  expect(lastValue(wrapper)).toBe(embedded)
})

it('does not reopen a reference during composition', async () => {
  const wrapper = await makeInput({ source: embedded })
  await focus(wrapper)

  wrapper
    .findComponent(EditorContent)
    .props('editor')
    ?.commands.setTextSelection(2)

  const event = new InputEvent('beforeinput', {
    inputType: 'deleteContentBackward',
    bubbles: true,
    cancelable: true,
    isComposing: true
  })

  wrapper.vm.element?.dispatchEvent(event)
  await nextTick()

  expect(event.defaultPrevented).toBe(false)
  expect(lastValue(wrapper)).toBeUndefined()
  expect(wrapper.find('.reference-token').exists()).toBe(true)
})

it('keeps user icon completion as Markdown text', async () => {
  const wrapper = await makeInput()
  await focus(wrapper)
  wrapper.vm.insertText(':@al')
  await nextTick()
  press(wrapper, 'Enter')

  expect(lastValue(wrapper)).toBe(':@alice: ')
})

it('updates a renamed label and falls back after deletion without modifying the source', async () => {
  const { usersMap } = useUsersStore()

  usersMap.value.set(
    'original-id',
    createUser({
      id: 'original-id',
      name: 'before'
    })
  )

  const wrapper = await makeInput({ source: embedded })

  expect(wrapper.text()).toContain('@before')

  usersMap.value.set(
    'original-id',
    createUser({
      id: 'original-id',
      name: 'after'
    })
  )

  await nextTick()

  expect(wrapper.text()).toContain('@after')

  usersMap.value.clear()
  await nextTick()

  expect(wrapper.text()).toContain('@alice')
  expect(lastValue(wrapper)).toBeUndefined()
})
