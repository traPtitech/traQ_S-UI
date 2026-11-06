import usePaste from '/@/composables/messageComposer/usePaste'
import { getTextFromHtml } from '/@/lib/dom/dataTransfer'

vi.mock('/@/lib/dom/dataTransfer', () => ({ getTextFromHtml: vi.fn() }))

const clipboardEvent = () => {
  const event = new Event('paste', { cancelable: true }) as ClipboardEvent
  Object.defineProperty(event, 'clipboardData', {
    value: {
      types: ['text/html', 'text/plain', 'image/svg+xml'],
      files: [],
      getData: (type: string) =>
        type === 'text/plain' ? 'fallback text' : '<b>converted</b>'
    }
  })
  return event
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

it('keeps converted text when clipboard permission lookup fails', async () => {
  vi.stubGlobal('navigator', {
    permissions: { query: vi.fn().mockRejectedValue(new Error('unsupported')) },
    clipboard: { read: vi.fn() }
  })
  vi.mocked(getTextFromHtml).mockResolvedValue('converted')
  const emit = vi.fn()
  const { preparePaste } = usePaste(emit)
  const event = clipboardEvent()
  const plan = preparePaste(event)

  expect(event.defaultPrevented).toBe(false)
  expect(emit).toHaveBeenCalledOnce()
  expect(plan?.type).toBe('text')
  expect(plan?.type === 'text' && (await plan.text)).toBe('converted')
  expect(await emit.mock.calls[0]?.[1]).toEqual([])
})

it('falls back to plain text without waiting for optional SVG extraction', async () => {
  const permission = Promise.withResolvers<PermissionStatus>()
  vi.stubGlobal('navigator', {
    permissions: { query: () => permission.promise },
    clipboard: { read: vi.fn() }
  })
  vi.mocked(getTextFromHtml).mockRejectedValue(new Error('invalid HTML'))
  const emit = vi.fn()
  const result = usePaste(emit).preparePaste(clipboardEvent())

  expect(result?.type === 'text' && (await result.text)).toBe('fallback text')
  permission.resolve({ state: 'denied' } as PermissionStatus)
  expect(await emit.mock.calls[0]?.[1]).toEqual([])
})
