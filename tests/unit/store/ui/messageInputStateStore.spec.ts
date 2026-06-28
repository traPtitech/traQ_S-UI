import type { Channel } from '@traptitech/traq'

import { nextTick } from 'vue'

import { createPinia, setActivePinia } from 'pinia'
import { vi } from 'vitest'

import { useChannelsStore } from '/@/store/entities/channels'
import type {
  MessageInputState,
  VirtualChannelId
} from '/@/store/ui/messageInputStateStore'
import { useMessageInputStateStore } from '/@/store/ui/messageInputStateStore'
import type { ChannelId } from '/@/types/entity-ids'

vi.mock('/@/composables/storage/useIndexedDbValue', async () => {
  const { reactive, ref } = await vi.importActual<{
    reactive: <T extends object>(target: T) => T
    ref: <T>(value: T) => { value: T }
  }>('vue')

  return {
    key: 'key',
    default: vi.fn(
      (
        _dbName: string,
        _version: number,
        _migrations: unknown,
        initialValue: object
      ) => [reactive(initialValue), ref(false), Promise.resolve()]
    )
  }
})

describe('useMessageInputStateStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('keeps normal channel inputs visible as drafts', () => {
    const store = useMessageInputStateStore()

    store.setStore(channelId, messageInputState('draft'))

    expect(store.getStore(channelId)).toEqual(messageInputState('draft'))
    expect(store.inputChannels.value).toEqual([
      [channelId, messageInputState('draft')]
    ])
    expect(store.hasInputChannel.value).toBe(true)
  })

  it('removes normal channel inputs when they become empty', () => {
    const store = useMessageInputStateStore()

    store.setStore(channelId, messageInputState('draft'))
    store.setStore(channelId, messageInputState(''))

    expect(store.getStore(channelId)).toBeUndefined()
    expect(store.inputChannels.value).toEqual([])
    expect(store.hasInputChannel.value).toBe(false)
  })

  it('removes normal channel inputs when the channel is archived', async () => {
    const store = useMessageInputStateStore()
    const { channelsMap } = useChannelsStore()

    store.setStore(channelId, messageInputState('draft'))
    channelsMap.value.set(channelId, channel({ archived: false }))
    await nextTick()

    channelsMap.value.set(channelId, channel({ archived: true }))
    await nextTick()

    expect(store.getStore(channelId)).toBeUndefined()
    expect(store.inputChannels.value).toEqual([])
    expect(store.hasInputChannel.value).toBe(false)
  })

  it('keeps virtual channel inputs available but hidden from drafts', () => {
    const store = useMessageInputStateStore()

    store.setStore(virtualChannelId, messageInputState('shared text'))

    expect(store.getStore(virtualChannelId)).toEqual(
      messageInputState('shared text')
    )
    expect(store.inputChannels.value).toEqual([])
    expect(store.hasInputChannel.value).toBe(false)
  })

  it('separates virtual channel inputs from normal channel inputs', () => {
    const store = useMessageInputStateStore()

    store.setStore(channelId, messageInputState('draft'))
    store.setStore(virtualChannelId, messageInputState('shared text'))

    expect(store.getStore(channelId)).toEqual(messageInputState('draft'))
    expect(store.getStore(virtualChannelId)).toEqual(
      messageInputState('shared text')
    )
    expect(store.inputChannels.value).toEqual([
      [channelId, messageInputState('draft')]
    ])

    store.setStore(virtualChannelId, messageInputState(''))

    expect(store.getStore(channelId)).toEqual(messageInputState('draft'))
    expect(store.getStore(virtualChannelId)).toBeUndefined()
    expect(store.inputChannels.value).toEqual([
      [channelId, messageInputState('draft')]
    ])
  })
})

const channelId = '11111111-1111-4111-8111-111111111111' as ChannelId
const virtualChannelId = 'share-target' satisfies VirtualChannelId

const messageInputState = (text: string): MessageInputState => ({
  text,
  attachments: []
})

const channel = ({ archived }: { archived: boolean }): Channel => ({
  id: channelId,
  name: 'general',
  parentId: null,
  archived,
  force: false,
  topic: '',
  children: []
})
