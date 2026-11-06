import { EditorContent } from '@tiptap/vue-3'
import { mount } from '@vue/test-utils'

import MessageEditor from '/@/components/Main/MainView/MessageElement/MessageEditor.vue'
import ReferenceInput from '/@/components/UI/ReferenceInput.vue'

import { embedded, installReferenceInputFixture } from './fixture'

await vi.hoisted(async () => {
  await import('./mocks')
})

installReferenceInputFixture()

vi.mock(
  '/@/components/Main/MainView/MessageElement/composables/useMessageEditing',
  () => ({
    useMessageEditing: () => ({
      editMessage: vi.fn(),
      cancel: vi.fn(),
      isBusy: false,
      isPostingAttachment: false,
      attachmentPostProgress: 0,
      addAttachment: vi.fn(),
      onAddAttachments: vi.fn()
    })
  })
)

vi.mock('/@/composables/messageComposer/useTextStampPickerInvoker', () => ({
  default: () => ({ toggleStampPicker: vi.fn() })
}))

it.each(['', 'first\nsecond\n', `hello ${embedded}`, ':test:'])(
  'starts editing at the end of %j',
  async rawContent => {
    const wrapper = mount(MessageEditor, {
      attachTo: document.body,
      props: { rawContent, messageId: 'message', channelId: 'channel' },
      global: {
        stubs: {
          MessageInputInsertStampButton: true,
          MessageInputUploadButton: true,
          MessageInputUploadProgress: true,
          MessageInputKeyGuide: true,
          FormButton: true,
          DropdownSuggester: true,
          AStamp: true
        }
      }
    })

    try {
      const input = wrapper.getComponent(ReferenceInput)
      await vi.waitFor(() => {
        const editor = input.getComponent(EditorContent).props('editor')
        if (!editor) throw new Error('Editor is not mounted')
        expect(document.activeElement).toBe(input.vm.element)
        expect(editor.state.selection.head).toBe(
          editor.state.doc.content.size - 1
        )
      })

      input.vm.insertText('!')
      await vi.waitFor(() =>
        expect(input.props('modelValue')).toBe(rawContent + '!')
      )
    } finally {
      wrapper.unmount()
    }
  }
)
