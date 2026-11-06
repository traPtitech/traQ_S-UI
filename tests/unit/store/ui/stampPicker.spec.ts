import { nextTick, reactive, ref, shallowRef } from 'vue'

import { createPinia, setActivePinia } from 'pinia'

import { isWebKit } from '/@/lib/dom/browser'
import { useStampPicker, useStampPickerInvoker } from '/@/store/ui/stampPicker'

import { withSetup } from '../../testUtils'

vi.mock('/@/composables/storage/useIndexedDbValue', () => ({
  default: (
    _key: string,
    _version: number,
    _migrations: unknown,
    initial: object
  ) => [reactive(initial)]
}))
vi.mock('/@/store/entities/stampPalettes', () => ({
  useStampPalettesStore: () => ({ nonEmptyStampPaletteIds: ref([]) })
}))

const setupInvoker = withSetup(useStampPickerInvoker)
const pinia = createPinia()

vi.mock('/@/lib/dom/browser', () => ({ isWebKit: vi.fn(() => false) }))

describe('stamp picker positioning', () => {
  let anchor: HTMLDivElement
  let viewport: EventTarget & { offsetTop: number; offsetLeft: number }
  let anchorTop: number
  let cleanups: (() => void)[]

  beforeEach(() => {
    vi.useFakeTimers()
    vi.mocked(isWebKit).mockReturnValue(false)
    setActivePinia(pinia)
    useStampPicker().closeStampPicker()
    cleanups = []
    anchorTop = 400
    viewport = Object.assign(new EventTarget(), { offsetTop: 0, offsetLeft: 0 })
    vi.stubGlobal('visualViewport', viewport)
    anchor = document.createElement('div')
    document.body.appendChild(anchor)
    vi.spyOn(anchor, 'getBoundingClientRect').mockImplementation(
      () => new DOMRect(100, anchorTop, 240, 80)
    )
  })

  afterEach(() => {
    for (const cleanup of cleanups) cleanup()
    useStampPicker().closeStampPicker()
    anchor.remove()
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  const setup = async () => {
    const [picker, { unmount }] = setupInvoker(
      vi.fn(),
      shallowRef(anchor),
      true,
      'bottom-right'
    )
    cleanups.push(unmount)
    picker.openStampPicker()
    await nextTick()
    return picker
  }

  it.each(['resize', 'scroll'])(
    'follows keyboard dismissal on visual viewport %s without a window resize',
    async event => {
      await setup()
      const { position } = useStampPicker()
      expect(position.value).toEqual({ x: 340, y: 396 })

      anchorTop = 700
      viewport.dispatchEvent(new Event(event))
      await vi.advanceTimersByTimeAsync(150)

      expect(position.value).toEqual({ x: 340, y: 696 })
    }
  )

  it('keeps the final keyboard animation position after several viewport events', async () => {
    await setup()
    anchorTop = 500
    viewport.dispatchEvent(new Event('resize'))
    anchorTop = 600
    viewport.dispatchEvent(new Event('scroll'))
    anchorTop = 700
    viewport.dispatchEvent(new Event('resize'))

    await vi.advanceTimersByTimeAsync(150)

    expect(useStampPicker().position.value).toEqual({ x: 340, y: 696 })
  })

  it.each([true, false])(
    'accounts for viewport offsets only for fixed WebKit positioning: %s',
    async webkit => {
      vi.mocked(isWebKit).mockReturnValue(webkit)
      viewport.offsetTop = 300
      viewport.offsetLeft = 20

      await setup()

      expect(useStampPicker().position.value).toEqual({
        x: webkit ? 360 : 340,
        y: webkit ? 696 : 396
      })
    }
  )

  it('keeps WebKit coordinates consistent as the keyboard viewport offset disappears', async () => {
    vi.mocked(isWebKit).mockReturnValue(true)
    viewport.offsetTop = 300
    await setup()
    expect(useStampPicker().position.value).toEqual({ x: 340, y: 696 })

    anchorTop = 700
    viewport.offsetTop = 0
    viewport.dispatchEvent(new Event('resize'))
    await vi.advanceTimersByTimeAsync(150)

    expect(useStampPicker().position.value).toEqual({ x: 340, y: 696 })
  })

  it('does not reopen after closing with a pending position update', async () => {
    const picker = await setup()
    window.dispatchEvent(new Event('resize'))
    anchorTop = 700
    window.dispatchEvent(new Event('resize'))
    picker.closeStampPicker()
    await nextTick()

    await vi.advanceTimersByTimeAsync(150)
    viewport.dispatchEvent(new Event('scroll'))
    await vi.advanceTimersByTimeAsync(150)

    expect(useStampPicker().isStampPickerShown.value).toBe(false)
  })

  it('cancels pending position updates when the invoker is unmounted', async () => {
    await setup()
    window.dispatchEvent(new Event('resize'))
    anchorTop = 700
    window.dispatchEvent(new Event('resize'))
    const { position } = useStampPicker()
    const previous = position.value

    for (const cleanup of cleanups) cleanup()
    cleanups = []
    await vi.advanceTimersByTimeAsync(150)

    expect(position.value).toEqual(previous)
  })

  it('still follows window resize if visualViewport is unavailable', async () => {
    vi.stubGlobal('visualViewport', undefined)
    await setup()
    anchorTop = 700

    window.dispatchEvent(new Event('resize'))
    await vi.advanceTimersByTimeAsync(150)

    expect(useStampPicker().position.value).toEqual({ x: 340, y: 696 })
  })
})
