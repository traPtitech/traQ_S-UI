import type { Message, Pin } from '@traptitech/traq'

import { reactive, ref } from 'vue'

import { flushPromises } from '@vue/test-utils'

import usePinnedMessages from '/@/composables/message/usePinnedMessages'
import useChannelSubscribers from '/@/composables/subscription/useChannelSubscribers'
import { wsListener } from '/@/lib/websocket'
import { messageMitt } from '/@/store/entities/messages'

import { withQuerySetup } from '../testUtils'

const mocks = vi.hoisted(() => ({
  pins: vi.fn(),
  pin: vi.fn(),
  subscribers: vi.fn()
}))

vi.mock('/@/lib/apis', () => ({
  default: {
    getChannelPins: mocks.pins,
    getPin: mocks.pin,
    getChannelSubscribers: mocks.subscribers
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

const subscriberEvents = wsListener as typeof wsListener & {
  emit: (event: 'CHANNEL_SUBSCRIBERS_CHANGED', payload: { id: string }) => void
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
  const [pins, { unmount }] = withQuerySetup(usePinnedMessages)(channelId)
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

  const [pins, { unmount }] = withQuerySetup(usePinnedMessages)(ref('current'))
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
  const [pins, { unmount }] = withQuerySetup(usePinnedMessages)(channelId)
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
  const [pins, { unmount }] = withQuerySetup(usePinnedMessages)(ref('current'))
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
  const [pins, { unmount }] = withQuerySetup(usePinnedMessages)(ref('current'))
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
    const [pins, { unmount }] = withQuerySetup(usePinnedMessages)(
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
    const [pins, { unmount }] = withQuerySetup(usePinnedMessages)(
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
  const [pins, { unmount }] = withQuerySetup(usePinnedMessages)(ref('current'))
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
  const [pins, { unmount }] = withQuerySetup(usePinnedMessages)(ref('current'))
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
  const [pins, { unmount }] = withQuerySetup(usePinnedMessages)(ref('current'))
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

it('ignores old subscribers and refreshes the current channel on reconnect', async () => {
  const pending = Promise.withResolvers<{ data: string[] }>()

  mocks.subscribers
    .mockReturnValueOnce(pending.promise)
    .mockResolvedValue({ data: ['current-user'] })

  const props = reactive({ channelId: 'old' })
  const [subscribers, { unmount }] = withQuerySetup(useChannelSubscribers)(
    props
  )
  disposers.push(unmount)
  props.channelId = 'current'
  await flushPromises()
  pending.resolve({ data: ['old-user'] })
  await flushPromises()

  expect([...subscribers.value]).toEqual(['current-user'])

  mocks.subscribers.mockResolvedValueOnce({ data: ['reconnected-user'] })
  websocket.emit('reconnect')
  await flushPromises()

  expect(mocks.subscribers).toHaveBeenLastCalledWith('current', {
    signal: expect.any(AbortSignal)
  })
  expect([...subscribers.value]).toEqual(['reconnected-user'])
})

it('does not clear current subscribers when an old channel request fails', async () => {
  const pending = Promise.withResolvers<{ data: string[] }>()
  const log = vi.spyOn(console, 'error').mockImplementation(() => undefined)

  mocks.subscribers
    .mockReturnValueOnce(pending.promise)
    .mockResolvedValueOnce({ data: ['current-user'] })

  const props = reactive({ channelId: 'old' })
  const [subscribers, { unmount }] = withQuerySetup(useChannelSubscribers)(
    props
  )
  disposers.push(unmount)
  props.channelId = 'current'
  await flushPromises()
  pending.reject(new Error('old failure'))
  await flushPromises()

  expect([...subscribers.value]).toEqual(['current-user'])
  expect(log).not.toHaveBeenCalled()
})

it('aborts subscriber requests on channel changes and unmount', async () => {
  mocks.subscribers.mockReturnValue(new Promise(() => undefined))
  const props = reactive({ channelId: 'old' })
  const [, { unmount }] = withQuerySetup(useChannelSubscribers)(props)
  const oldSignal = mocks.subscribers.mock.calls[0]?.[1].signal as AbortSignal

  props.channelId = 'current'
  await flushPromises()

  expect(oldSignal.aborted).toBe(true)

  const currentSignal = mocks.subscribers.mock.calls[1]?.[1]
    .signal as AbortSignal

  unmount()

  expect(currentSignal.aborted).toBe(true)
})

it('restarts the initial subscriber fetch when a change event arrives', async () => {
  const pending = Promise.withResolvers<{ data: string[] }>()

  mocks.subscribers
    .mockReturnValueOnce(pending.promise)
    .mockResolvedValueOnce({ data: ['new-user'] })

  const [subscribers, { unmount }] = withQuerySetup(useChannelSubscribers)({
    channelId: 'current'
  })

  disposers.push(unmount)
  subscriberEvents.emit('CHANNEL_SUBSCRIBERS_CHANGED', { id: 'current' })
  await flushPromises()

  expect(mocks.subscribers).toHaveBeenCalledTimes(2)
  expect([...subscribers.value]).toEqual(['new-user'])

  pending.resolve({ data: ['old-user'] })
  await flushPromises()

  expect([...subscribers.value]).toEqual(['new-user'])
})

it('shares subscriber requests between consumers of the same channel', async () => {
  const pending = Promise.withResolvers<{ data: string[] }>()
  mocks.subscribers.mockReturnValueOnce(pending.promise)

  const [[first, second], { unmount }] = withQuerySetup(
    () =>
      [
        useChannelSubscribers({ channelId: 'current' }),
        useChannelSubscribers({ channelId: 'current' })
      ] as const
  )()

  disposers.push(unmount)

  expect(mocks.subscribers).toHaveBeenCalledTimes(1)

  pending.resolve({ data: ['shared-user'] })
  await flushPromises()

  expect([...first.value]).toEqual(['shared-user'])
  expect([...second.value]).toEqual(['shared-user'])
})

it('uses the query channel when one shared subscriber consumer changes channels', async () => {
  mocks.subscribers.mockImplementation(async (channelId: string) => ({
    data: [`user-of-${channelId}`]
  }))

  const moving = reactive({ channelId: 'first' })

  const [[remaining, moved], { unmount }] = withQuerySetup(
    () =>
      [
        useChannelSubscribers({ channelId: 'first' }),
        useChannelSubscribers(moving)
      ] as const
  )()

  disposers.push(unmount)
  await flushPromises()
  moving.channelId = 'second'
  await flushPromises()

  subscriberEvents.emit('CHANNEL_SUBSCRIBERS_CHANGED', { id: 'first' })
  await flushPromises()

  expect([...remaining.value]).toEqual(['user-of-first'])
  expect([...moved.value]).toEqual(['user-of-second'])
})
