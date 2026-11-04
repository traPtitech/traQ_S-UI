import { ref } from 'vue'

import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { fn } from 'storybook/test'

import PrimaryViewSidebarPage from '/@/components/Main/MainView/PrimaryViewSidebar/PrimaryViewSidebarPage.vue'
import SidebarContentContainer from '/@/components/Main/MainView/PrimaryViewSidebar/SidebarContentContainer.vue'
import SidebarHeader from '/@/components/Main/MainView/PrimaryViewSidebar/SidebarHeader.vue'
import FormButton from '/@/components/UI/FormButton.vue'

import ThreadNameEditor from './ThreadNameEditor.vue'

type StoryArgs = InstanceType<typeof ThreadNameEditor>['$props'] & {
  width: number
  inSidebar: boolean
  saveResult: 'success' | 'error'
}

const meta = {
  title: 'Main/Thread/ThreadNameEditor',
  component: ThreadNameEditor,
  args: {
    currentName: 'スレッドの名前',
    modelValue: '編集中のスレッド名',
    isEditing: false,
    isSaving: false,
    errorMessage: null,
    width: 300,
    inSidebar: false,
    saveResult: 'success',
    onEdit: fn(),
    onSave: fn(),
    onCancel: fn(),
    'onUpdate:modelValue': fn()
  },
  argTypes: {
    width: { control: { type: 'range', min: 180, max: 480, step: 8 } },
    saveResult: { control: 'radio', options: ['success', 'error'] }
  },
  parameters: {
    docs: {
      description: {
        component:
          '確定名・編集値・編集中・保存中・エラーは親が管理します。保存・取消を通知するフォームで、APIは呼びません。Interactiveでは外側からの編集開始と保存成功／失敗を試せます。'
      }
    }
  },
  render: args => ({
    components: {
      ThreadNameEditor,
      SidebarContentContainer,
      PrimaryViewSidebarPage,
      SidebarHeader
    },
    setup: () => ({ args }),
    template: `
      <div :style="{ width: (args.inSidebar ? 320 : args.width) + 'px', maxWidth: '100%', height: args.inSidebar ? '640px' : 'auto' }">
        <PrimaryViewSidebarPage v-if="args.inSidebar" :show-close-button="false">
          <template #header><SidebarHeader :text="args.currentName" /></template>
          <template #content>
            <SidebarContentContainer><ThreadNameEditor v-bind="args" /></SidebarContentContainer>
          </template>
        </PrimaryViewSidebarPage>
        <SidebarContentContainer v-else><ThreadNameEditor v-bind="args" /></SidebarContentContainer>
      </div>
    `
  })
} satisfies Meta<StoryArgs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Editing: Story = { args: { isEditing: true } }
export const Saving: Story = { args: { isEditing: true, isSaving: true } }
export const Error: Story = {
  args: {
    isEditing: true,
    errorMessage: '名前の保存に失敗しました。もう一度お試しください。'
  }
}
export const LongName: Story = {
  args: { currentName: '長いスレッド名'.repeat(30), width: 200 }
}
export const InSidebar: Story = {
  args: { inSidebar: true, isEditing: true }
}
export const Dark: Story = {
  args: { inSidebar: true, isEditing: true },
  globals: { theme: 'dark' }
}

export const Interactive: Story = {
  parameters: { controls: { include: ['saveResult'] } },
  render: args => ({
    components: { ThreadNameEditor, SidebarContentContainer, FormButton },
    setup() {
      const currentName = ref(args.currentName)
      const draft = ref(args.currentName)
      const isEditing = ref(false)
      const isSaving = ref(false)
      const errorMessage = ref<string | null>(null)

      const edit = () => {
        draft.value = currentName.value
        errorMessage.value = null
        isEditing.value = true
        args.onEdit?.()
      }
      const save = async (name: string) => {
        if (isSaving.value) return
        args.onSave?.(name)
        isSaving.value = true
        errorMessage.value = null
        await new Promise(resolve => setTimeout(resolve, 700))
        if (args.saveResult === 'error') {
          errorMessage.value =
            '名前の保存に失敗しました。もう一度お試しください。'
        } else {
          currentName.value = name
          isEditing.value = false
        }
        isSaving.value = false
      }
      const cancel = () => {
        draft.value = currentName.value
        errorMessage.value = null
        isEditing.value = false
        args.onCancel?.()
      }
      return {
        currentName,
        draft,
        isEditing,
        isSaving,
        errorMessage,
        edit,
        save,
        cancel
      }
    },
    template: `
      <div style="width: 300px; max-width: 100%; display: flex; flex-direction: column; gap: 16px;">
        <FormButton label="外側から名前の編集を開く" type="secondary" :disabled="isEditing || isSaving" @click="edit" />
        <SidebarContentContainer>
          <ThreadNameEditor
            v-model="draft"
            :current-name="currentName"
            :is-editing="isEditing"
            :is-saving="isSaving"
            :error-message="errorMessage"
            @edit="edit"
            @save="save"
            @cancel="cancel"
          />
        </SidebarContentContainer>
      </div>
    `
  })
}
