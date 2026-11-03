import { nextTick } from 'vue'

import { EditorContent } from '@tiptap/vue-3'
import { mount } from '@vue/test-utils'

import MessageInputEditor from '/@/components/Main/MainView/MessageInput/MessageInputEditor.vue'
import DropdownSuggester from '/@/components/UI/DropdownSuggester/DropdownSuggester.vue'
import ReferenceInput from '/@/components/UI/ReferenceInput.vue'
import { encodeReference } from '/@/lib/references'
import { useBrowserSettings } from '/@/store/app/browserSettings'
import { useFeatureFlagSettings } from '/@/store/app/featureFlagSettings'

import { press, setBranchingChannelTree } from './fixture'

await vi.hoisted(async () => {
  await import('./mocks')
})

it('retains Undo when a busy operation ends with an empty draft', async () => {
  const wrapper = mount(MessageInputEditor, {
    attachTo: document.body,
    props: {
      modelValue: 'draft',
      documentKey: 'same-message',
      'onUpdate:modelValue': value => {
        void wrapper.setProps({ modelValue: value })
      }
    },
    global: { stubs: { DropdownSuggester: true } }
  })

  try {
    await nextTick()
    const input = wrapper.getComponent(ReferenceInput)
    const editor = input.getComponent(EditorContent).props('editor')

    if (!editor) throw new Error('Editor is not mounted')

    editor.commands.selectAll()
    editor.commands.deleteSelection()
    await nextTick()
    await wrapper.setProps({ isPosting: true })
    await wrapper.setProps({ isPosting: false })
    editor.view.focus()
    press(input, 'z', { ctrlKey: true })
    await nextTick()

    expect(wrapper.props('modelValue')).toBe('draft')
  } finally {
    wrapper.unmount()
  }
})

describe.each([true, false])(
  'suggestion confirmation with Enter send mode and Markdown %s',
  markdown => {
    it.each([
      {
        name: 'a partial channel',
        text: '#te',
        keys: [],
        result: { type: 'channel', id: 'team', raw: '#team' }
      },
      {
        name: 'a parent with no child selected',
        text: '#team',
        keys: [],
        result: { type: 'channel', id: 'team', raw: '#team' }
      },
      {
        name: 'a candidate previewed with Tab',
        text: '#team',
        keys: ['Tab'],
        result: { type: 'channel', id: 'sysad', raw: '#team/SysAd' }
      },
      {
        name: 'a candidate selected with arrow keys',
        text: '#team',
        keys: ['ArrowDown', 'ArrowDown'],
        result: { type: 'channel', id: 'sysdev', raw: '#team/SysDev' }
      },
      {
        name: 'a user mention',
        text: '@al',
        keys: [],
        result: { type: 'user', id: 'original-id', raw: '@alice' }
      },
      {
        name: 'a stamp',
        text: ':testi',
        keys: [],
        result: ':testing: '
      }
    ] as const)(
      'confirms $name without sending, then sends on the next Enter',
      async ({ text, keys, result }) => {
        setBranchingChannelTree()
        useBrowserSettings().sendWithModifierKey.value = 'none'
        useFeatureFlagSettings().featureFlags.value.inline_markdown.enabled =
          markdown

        const updateModel = (value: string): void => {
          void wrapper.setProps({ modelValue: value })
        }

        const wrapper = mount(MessageInputEditor, {
          attachTo: document.body,
          props: { modelValue: '', 'onUpdate:modelValue': updateModel },
          global: { stubs: { DropdownSuggester: true } }
        })

        try {
          await nextTick()
          const input = wrapper.getComponent(ReferenceInput)
          expect(input.props('markdown')).toBe(markdown)

          await vi.waitFor(() =>
            expect(input.vm.element?.isConnected).toBe(true)
          )

          input.vm.element?.focus()
          await nextTick()
          input.vm.insertText(text)
          await nextTick()

          for (const key of keys) {
            press(input, key)
            await nextTick()
          }

          expect(input.getComponent(DropdownSuggester).props('isShown')).toBe(
            true
          )
          expect(press(input, 'Enter')).toBe(false)
          await nextTick()
          const expected =
            typeof result === 'string' ? result : encodeReference(result) + ' '

          expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe(
            expected
          )
          expect(wrapper.emitted('postMessage')).toBeUndefined()
          expect(input.emitted('keydown')).toBeUndefined()
          expect(input.getComponent(DropdownSuggester).props('isShown')).toBe(
            false
          )

          expect(press(input, 'Enter')).toBe(false)
          await nextTick()
          expect(wrapper.emitted('postMessage')).toHaveLength(1)
          expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe(
            expected
          )
        } finally {
          wrapper.unmount()
        }
      }
    )
  }
)
