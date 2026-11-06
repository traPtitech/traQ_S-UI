import { nextTick } from 'vue'

import DropdownSuggester from '/@/components/UI/DropdownSuggester/DropdownSuggester.vue'
import { encodeReference } from '/@/lib/references'
import { useChannelsStore } from '/@/store/entities/channels'
import { useGroupsStore } from '/@/store/entities/groups'
import { useUsersStore } from '/@/store/entities/users'

import {
  createChannel,
  createUser,
  createUserGroup
} from '../../../fixtures/entities'
import {
  embedded,
  focus,
  getEditor,
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

  const editor = getEditor(wrapper)

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
    const editor = getEditor(wrapper)

    await new Promise(resolve => setTimeout(resolve, 80))
    const dispatch = vi.spyOn(editor.view, 'dispatch')

    await new Promise(resolve => setTimeout(resolve, 160))

    expect(dispatch).not.toHaveBeenCalled()
  }
)

it('reopens a reference for a software keyboard Backspace without keydown', async () => {
  const wrapper = await makeInput({ source: embedded })
  await focus(wrapper)

  getEditor(wrapper)?.commands.setTextSelection(2)

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

  getEditor(wrapper)?.commands.setTextSelection(2)

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

it.each(['user', 'group', 'channel'] as const)(
  'renames a %s reference without rebuilding adjacent Markdown or changing undo',
  async type => {
    const id = 'renamed-id'
    const rename = (name: string) => {
      if (type === 'user')
        useUsersStore().usersMap.value.set(id, createUser({ id, name }))
      if (type === 'group')
        useGroupsStore().userGroupsMap.value.set(
          id,
          createUserGroup({ id, name })
        )
      if (type === 'channel')
        useChannelsStore().channelsMap.value.set(
          id,
          createChannel({ id, name })
        )
    }

    rename('before')
    const reference = encodeReference({
      type,
      id,
      raw: type === 'channel' ? '#before' : '@before'
    })
    const source = reference + ' :test: tail'
    const wrapper = await makeInput({ source })
    await wrapper.setProps({ markdown: true })
    await focus(wrapper)
    const editor = getEditor(wrapper)
    editor.commands.setTextSelection(editor.state.doc.content.size - 1)
    editor.commands.insertContent('!')
    await nextTick()
    const widget = wrapper.find('.markdown-input-rendered').element

    rename('after')
    await nextTick()

    expect(wrapper.find('.reference-token').text()).toContain('after')
    expect(wrapper.find('.markdown-input-rendered').element).toBe(widget)
    expect(lastValue(wrapper)).toBe(source + '!')

    press(wrapper, 'z', { ctrlKey: true })
    expect(lastValue(wrapper)).toBe(source)
  }
)
