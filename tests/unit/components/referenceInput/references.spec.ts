import { type User } from '@traptitech/traq'

import { nextTick } from 'vue'

import { EditorContent } from '@tiptap/vue-3'

import DropdownSuggester from '/@/components/UI/DropdownSuggester/DropdownSuggester.vue'
import { useUsersStore } from '/@/store/entities/users'

import { embedded, focus, lastValue, makeInput, press } from './fixture'

await vi.hoisted(async () => {
  await import('./mocks')
})

it('reopens a reference for a software keyboard Backspace without keydown', async () => {
  const wrapper = await makeInput(embedded)
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
  const wrapper = await makeInput(embedded)
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

  expect(lastValue(wrapper)).toBe(':@alice')
})

it('updates a renamed label and falls back after deletion without modifying the source', async () => {
  const { usersMap } = useUsersStore()

  usersMap.value.set('original-id', {
    id: 'original-id',
    name: 'before'
  } as User)

  const wrapper = await makeInput(embedded)

  expect(wrapper.text()).toContain('@before')

  usersMap.value.set('original-id', {
    id: 'original-id',
    name: 'after'
  } as User)

  await nextTick()

  expect(wrapper.text()).toContain('@after')

  usersMap.value.clear()
  await nextTick()

  expect(wrapper.text()).toContain('@alice')
  expect(lastValue(wrapper)).toBeUndefined()
})
