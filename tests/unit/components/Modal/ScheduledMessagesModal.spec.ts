import type * as Vue from 'vue'

import { flushPromises, mount } from '@vue/test-utils'
import { vi } from 'vitest'

import type * as ScheduledMessages from '/@/lib/scheduledMessages'
import ScheduledMessagesModal from '/@/components/Modal/ScheduledMessagesModal/ScheduledMessagesModal.vue'
import type { ScheduledMessage } from '/@/lib/scheduledMessages'
import type { MessageInputState } from '/@/store/ui/messageInputStateStore'

const mocks = vi.hoisted(() => ({
  list: vi.fn(),
  cancel: vi.fn(),
  download: vi.fn(),
  schedule: vi.fn(),
  getStore: vi.fn(),
  setStore: vi.fn(),
  clearModal: vi.fn(),
  push: vi.fn(),
  addErrorToast: vi.fn(),
  addSuccessToast: vi.fn(),
  posting: new Set<string>()
}))
vi.mock('/@/lib/scheduledMessages', async importOriginal => ({
  ...(await importOriginal<typeof ScheduledMessages>()),
  scheduledMessageApis: { list: mocks.list, cancel: mocks.cancel },
  downloadScheduledAttachments: mocks.download
}))
vi.mock('/@/store/ui/messageInputStateStore', () => ({
  createDefaultValue: () => ({ text: '', attachments: [] }),
  useMessageInputStateStore: () => ({
    getStore: mocks.getStore,
    setStore: mocks.setStore,
    postingChannels: { value: mocks.posting }
  })
}))
vi.mock(
  '/@/components/Main/MainView/MessageInput/composables/usePostMessage',
  async () => {
    const { ref } = await vi.importActual<typeof Vue>('vue')
    return {
      default: () => ({
        scheduleMessage: mocks.schedule,
        isPosting: ref(false),
        progress: ref(0)
      })
    }
  }
)
vi.mock('/@/composables/useChannelPath', () => ({
  default: () => ({
    channelIdToPathString: () => '#general',
    channelIdToLink: () => '/channels/general'
  })
}))
vi.mock('/@/store/ui/modal', () => ({
  useModalStore: () => ({ clearModal: mocks.clearModal })
}))
vi.mock('/@/store/entities/messages', () => ({
  useMessagesStore: () => ({ fetchFileMetaData: vi.fn() })
}))
vi.mock('/@/store/ui/toast', () => ({
  useToastStore: () => ({
    addErrorToast: mocks.addErrorToast,
    addSuccessToast: mocks.addSuccessToast
  })
}))
vi.mock('/@/router', () => ({
  default: { push: mocks.push },
  constructFilesPath: (id: string) => `/files/${id}`
}))

const message: ScheduledMessage = {
  id: 'reservation',
  channelId: 'channel',
  content: 'notice with attachment',
  draftContent: 'notice',
  fileIds: ['file'],
  status: 'pending',
  failure: '',
  scheduledAt: '2100-01-01T00:00:00Z',
  createdAt: '2026-10-10T00:00:00Z'
}
const render = () =>
  mount(ScheduledMessagesModal, {
    props: { channelId: 'channel' },
    global: {
      mocks: { $boolAttr: (value: boolean) => value || undefined },
      stubs: {
        ModalFrame: { template: '<div><slot /></div>' },
        MessageInputPreview: true,
        MessageFileList: true,
        MessageInputUploadProgress: true,
        FormInput: { template: '<input />' },
        FormButton: {
          props: ['label', 'disabled', 'loading'],
          emits: ['click'],
          template:
            '<button :disabled="disabled || loading" @click="$emit(\'click\')">{{ label }}</button>'
        }
      }
    }
  })

beforeEach(() => {
  vi.clearAllMocks()
  mocks.posting.clear()
  mocks.list.mockResolvedValue({ data: [message] })
  mocks.cancel.mockResolvedValue({})
  mocks.getStore.mockReturnValue({ text: 'existing draft', attachments: [] })
  mocks.download.mockResolvedValue([
    {
      file: new File(['bytes'], 'notice.png', { type: 'image/png' }),
      type: 'image'
    }
  ])
})

it('downloads before canceling and preserves the existing draft', async () => {
  const order: string[] = []
  const attachment = {
    file: new File(['bytes'], 'notice.png', { type: 'image/png' }),
    type: 'image'
  }
  mocks.download.mockImplementation(async () => {
    order.push('download')
    return [attachment]
  })
  mocks.cancel.mockImplementation(async () => {
    order.push('cancel')
  })
  const wrapper = render()
  await flushPromises()
  await wrapper
    .findAll('button')
    .find(b => b.text() === '下書きに戻す')
    ?.trigger('click')
  await flushPromises()
  expect(order).toEqual(['download', 'cancel'])
  expect(mocks.setStore).toHaveBeenCalledWith('channel', {
    text: 'existing draft\n\nnotice',
    attachments: [attachment]
  })
  expect(mocks.clearModal).toHaveBeenCalledOnce()
  expect(mocks.push).toHaveBeenCalledWith('/channels/general')
  expect(mocks.posting.size).toBe(0)
  wrapper.unmount()
})

it('keeps the reservation intact when an attachment cannot be downloaded', async () => {
  mocks.download.mockRejectedValue(new Error('download failed'))
  const wrapper = render()
  await flushPromises()
  await wrapper
    .findAll('button')
    .find(b => b.text() === '下書きに戻す')
    ?.trigger('click')
  await flushPromises()
  expect(mocks.cancel).not.toHaveBeenCalled()
  expect(mocks.setStore).not.toHaveBeenCalled()
  expect(mocks.posting.size).toBe(0)
  wrapper.unmount()
})

it('preserves downloaded data when the cancellation response is lost', async () => {
  mocks.cancel.mockRejectedValue(new Error('network disconnected'))
  const wrapper = render()
  await flushPromises()
  await wrapper
    .findAll('button')
    .find(b => b.text() === '下書きに戻す')
    ?.trigger('click')
  await flushPromises()
  const restored = mocks.setStore.mock.calls.at(0)?.[1] as MessageInputState
  expect(restored.text).toBe('existing draft\n\nnotice')
  expect(restored.attachments.at(0)?.file.name).toBe('notice.png')
  expect(mocks.addSuccessToast).not.toHaveBeenCalled()
  expect(mocks.addErrorToast).toHaveBeenCalledWith(
    expect.stringContaining('取消の結果を確認できません')
  )
  wrapper.unmount()
})

it('does not restore an already-sent message', async () => {
  mocks.cancel.mockRejectedValue({
    isAxiosError: true,
    response: { status: 409 }
  })
  const wrapper = render()
  await flushPromises()
  await wrapper
    .findAll('button')
    .find(b => b.text() === '下書きに戻す')
    ?.trigger('click')
  await flushPromises()
  expect(mocks.setStore).not.toHaveBeenCalled()
  expect(mocks.addSuccessToast).not.toHaveBeenCalled()
  wrapper.unmount()
})
