import type { Message, Pin } from '@traptitech/traq'

import { ref } from 'vue'

import { flushPromises } from '@vue/test-utils'

import usePinnedMessages from '/@/composables/message/usePinnedMessages'
import { wsListener } from '/@/lib/websocket'
import { messageMitt } from '/@/store/entities/messages'

import { withSetup } from '../testUtils'

const mocks = vi.hoisted(() => ({
  pins: vi.fn(),
  pin: vi.fn()
}))

vi.mock('/@/lib/apis', () => ({
  default: {
    getChannelPins: mocks.pins,
    getPin: mocks.pin
  }
}))

vi.mock('/@/lib/websocket', async () => {
  const { default: mitt } = await import('mitt')

  return { wsListener: mitt() }
})

vi.mock('/@/store/entities/messages', async () => {
  const { default: mitt } = await import('mitt')

  return { messageMitt: mitt() }
})

const disposers: Array<() => void> = []

const websocket = wsListener as typeof wsListener & {
  emit: (event: 'reconnect') => void
}

const pin = (id: string): Pin => ({
  userId: 'user',
  pinnedAt: '2026-11-06T00:00:00Z',
  message: { id, channelId: 'current' } as Message
})

beforeEach(() => vi.resetAllMocks())

afterEach(() => {
  disposers.splice(0).forEach(dispose => dispose())
  vi.restoreAllMocks()
})

it('ignores pins from an old channel after the current channel has loaded', async () => {
  const pending = Promise.withResolvers<{ data: Pin[] }>()

  mocks.pins
    .mockReturnValueOnce(pending.promise)
    .mockResolvedValueOnce({ data: [pin('current')] })

  const channelId = ref('old')
  const [pins, { unmount }] = withSetup(usePinnedMessages)(channelId)
  disposers.push(unmount)
  channelId.value = 'current'
  await flushPromises()
  pending.resolve({ data: [pin('old')] })
  await flushPromises()

  expect(pins.value.map(p => p.message.id)).toEqual(['current'])
})

it('allows independent pin metadata requests to finish in either order', async () => {
  mocks.pins.mockResolvedValue({ data: [] })
  const first = Promise.withResolvers<{ data: Pin }>()
  const second = Promise.withResolvers<{ data: Pin }>()

  mocks.pin
    .mockReturnValueOnce(first.promise)
    .mockReturnValueOnce(second.promise)

  const [pins, { unmount }] = withSetup(usePinnedMessages)(ref('current'))
  disposers.push(unmount)
  await flushPromises()
  messageMitt.emit('pinMessage', pin('first').message)
  messageMitt.emit('pinMessage', pin('second').message)
  second.resolve({ data: pin('second') })
  await flushPromises()
  first.resolve({ data: pin('first') })
  await flushPromises()

  expect(pins.value.map(p => p.message.id)).toEqual(['second', 'first'])
})

it('does not add pin metadata fetched before a channel change', async () => {
  mocks.pins.mockResolvedValue({ data: [] })
  const metadata = Promise.withResolvers<{ data: Pin }>()
  mocks.pin.mockReturnValueOnce(metadata.promise)
  const channelId = ref('current')
  const [pins, { unmount }] = withSetup(usePinnedMessages)(channelId)
  disposers.push(unmount)
  await flushPromises()
  messageMitt.emit('pinMessage', pin('old').message)
  channelId.value = 'next'
  metadata.resolve({ data: pin('old') })
  await flushPromises()

  expect(pins.value).toEqual([])
})

it('preserves a live pin when an older reconnect snapshot finishes afterwards', async () => {
  mocks.pins.mockResolvedValueOnce({ data: [] })
  mocks.pin.mockResolvedValue({ data: pin('new') })
  const [pins, { unmount }] = withSetup(usePinnedMessages)(ref('current'))
  disposers.push(unmount)
  await flushPromises()

  const refresh = Promise.withResolvers<{ data: Pin[] }>()
  mocks.pins.mockReturnValueOnce(refresh.promise)
  websocket.emit('reconnect')
  messageMitt.emit('pinMessage', pin('new').message)
  await flushPromises()

  expect(pins.value.map(p => p.message.id)).toEqual(['new'])

  refresh.resolve({ data: [] })
  await flushPromises()

  expect(pins.value.map(p => p.message.id)).toEqual(['new'])
})

it('deduplicates pin metadata that finishes after a reconnect snapshot', async () => {
  mocks.pins.mockResolvedValueOnce({ data: [] })
  const [pins, { unmount }] = withSetup(usePinnedMessages)(ref('current'))
  disposers.push(unmount)
  await flushPromises()

  const metadata = Promise.withResolvers<{ data: Pin }>()
  mocks.pin.mockReturnValueOnce(metadata.promise)
  messageMitt.emit('pinMessage', pin('new').message)

  mocks.pins.mockResolvedValueOnce({ data: [pin('new')] })
  websocket.emit('reconnect')
  await flushPromises()

  metadata.resolve({ data: pin('new') })
  await flushPromises()

  expect(pins.value.map(p => p.message.id)).toEqual(['new'])
})

it.each(['unpinMessage', 'deleteMessage'] as const)(
  'replays %s events received during a reconnect fetch',
  async event => {
    mocks.pins.mockResolvedValueOnce({ data: [pin('removed')] })
    const [pins, { unmount }] = withSetup(usePinnedMessages)(
      ref('current')
    )
    disposers.push(unmount)
    await flushPromises()

    const refresh = Promise.withResolvers<{ data: Pin[] }>()
    mocks.pins.mockReturnValueOnce(refresh.promise)
    websocket.emit('reconnect')
    messageMitt.emit(event, 'removed')
    refresh.resolve({ data: [pin('removed')] })
    await flushPromises()

    expect(pins.value).toEqual([])
  }
)

it.each(['unpinMessage', 'deleteMessage'] as const)(
  'ignores pending pin metadata after %s removes the pin',
  async event => {
    mocks.pins.mockResolvedValueOnce({ data: [] })
    const [pins, { unmount }] = withSetup(usePinnedMessages)(
      ref('current')
    )
    disposers.push(unmount)
    await flushPromises()

    const metadata = Promise.withResolvers<{ data: Pin }>()
    mocks.pin.mockReturnValueOnce(metadata.promise)
    messageMitt.emit('pinMessage', pin('removed').message)
    messageMitt.emit(event, 'removed')
    metadata.resolve({ data: pin('removed') })
    await flushPromises()

    expect(pins.value).toEqual([])
  }
)

it('keeps the newest pin when an earlier pin request finishes after a repin', async () => {
  mocks.pins.mockResolvedValueOnce({ data: [] })
  const [pins, { unmount }] = withSetup(usePinnedMessages)(ref('current'))
  disposers.push(unmount)
  await flushPromises()

  const first = Promise.withResolvers<{ data: Pin }>()
  const second = Promise.withResolvers<{ data: Pin }>()

  mocks.pin
    .mockReturnValueOnce(first.promise)
    .mockReturnValueOnce(second.promise)

  messageMitt.emit('pinMessage', pin('repinned').message)
  messageMitt.emit('unpinMessage', 'repinned')
  messageMitt.emit('pinMessage', pin('repinned').message)

  const newest = { ...pin('repinned'), pinnedAt: '2026-11-06T01:00:00Z' }
  second.resolve({ data: newest })
  await flushPromises()
  first.resolve({ data: pin('repinned') })
  await flushPromises()

  expect(pins.value).toEqual([newest])
})

it('replays message edits over an older reconnect snapshot', async () => {
  const original = pin('edited')
  mocks.pins.mockResolvedValueOnce({ data: [original] })
  const [pins, { unmount }] = withSetup(usePinnedMessages)(ref('current'))
  disposers.push(unmount)
  await flushPromises()

  const refresh = Promise.withResolvers<{ data: Pin[] }>()
  mocks.pins.mockReturnValueOnce(refresh.promise)
  websocket.emit('reconnect')

  const edited = { ...original.message, content: 'edited content' }
  messageMitt.emit('updateMessage', edited)
  refresh.resolve({ data: [original] })
  await flushPromises()

  expect(pins.value[0]?.message).toEqual(edited)
})

it('uses the latest message edit when pending pin metadata finishes', async () => {
  mocks.pins.mockResolvedValueOnce({ data: [] })
  const [pins, { unmount }] = withSetup(usePinnedMessages)(ref('current'))
  disposers.push(unmount)
  await flushPromises()

  const metadata = Promise.withResolvers<{ data: Pin }>()
  mocks.pin.mockReturnValueOnce(metadata.promise)
  messageMitt.emit('pinMessage', pin('edited').message)

  const edited = { ...pin('edited').message, content: 'edited content' }
  messageMitt.emit('updateMessage', edited)
  metadata.resolve({ data: pin('edited') })
  await flushPromises()

  expect(pins.value[0]?.message).toEqual(edited)
})
