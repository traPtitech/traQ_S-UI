import { type ComputedRef, defineComponent, h, nextTick, ref } from 'vue'

import type * as VueVirtual from '@tanstack/vue-virtual'
import { enableAutoUnmount, mount } from '@vue/test-utils'

import ChannelTree from '/@/components/Main/NavigationBar/ChannelList/ChannelTree.vue'
import { provideNavigationVisibility } from '/@/components/Main/NavigationBar/composables/useNavigationVisibility'
import type { ChannelId } from '/@/types/entity-ids'

const scrollMock = vi.hoisted(() => ({
  instance: undefined as
    VueVirtual.Virtualizer<HTMLElement, HTMLElement> | undefined
}))

vi.mock('@tanstack/vue-virtual', async importOriginal => {
  const actual = await importOriginal<typeof VueVirtual>()
  const { computed } = await import('vue')

  return {
    ...actual,
    useVirtualizer: (
      options: ComputedRef<
        VueVirtual.VirtualizerOptions<HTMLElement, HTMLElement>
      >
    ) => {
      const virtualizer = actual.useVirtualizer(
        computed<VueVirtual.VirtualizerOptions<HTMLElement, HTMLElement>>(
          () => ({
            ...options.value,
            observeElementRect: (_instance, callback) => {
              callback({ width: 320, height: 360 })
            }
          })
        )
      )

      scrollMock.instance = virtualizer.value
      return virtualizer
    }
  }
})

vi.mock(
  '/@/components/Main/NavigationBar/ChannelList/ChannelElement.vue',
  () => ({ default: { template: '<div />' } })
)

enableAutoUnmount(afterEach)

const dispatchTouchEvent = (
  target: EventTarget,
  type: 'touchstart' | 'touchend' | 'touchcancel',
  changedIds = [0],
  activeIds = type === 'touchstart' ? changedIds : []
) => {
  const toTouches = (ids: number[]) =>
    ids.map(identifier => ({ identifier, target }) as Touch)

  target.dispatchEvent(
    new TouchEvent(type, {
      bubbles: true,
      changedTouches: toTouches(changedIds),
      touches: toTouches(activeIds)
    })
  )
}

const createScrollElement = (roundOffset = false) => {
  const scrollElement = document.createElement('div')

  Object.defineProperties(scrollElement, {
    scrollHeight: { value: 1800 },
    clientHeight: { value: 360 }
  })

  scrollElement.scrollTop = 180
  scrollElement.scrollTo = vi.fn(
    (options: ScrollToOptions | number = {}, y?: number) => {
      const offset =
        (typeof options === 'number' ? y : options.top) ??
        scrollElement.scrollTop
      const nextOffset = roundOffset ? Math.round(offset) : offset
      if (nextOffset === scrollElement.scrollTop) return

      scrollElement.scrollTop = nextOffset
      queueMicrotask(() => scrollElement.dispatchEvent(new Event('scroll')))
    }
  )

  return scrollElement
}

const setup = async (roundOffset = false, initiallyVisible = true) => {
  const channels = Array.from({ length: 50 }, (_, index) => ({
    id: String(index) as ChannelId,
    name: String(index),
    children: [],
    active: true,
    archived: false
  }))
  const scrollElement = createScrollElement(roundOffset)
  const isVisible = ref(initiallyVisible)

  const VisibilityProvider = defineComponent({
    props: { scrollElement: { type: HTMLElement, required: true } },
    setup(props) {
      provideNavigationVisibility(isVisible)

      return () =>
        h(ChannelTree, { channels, scrollElement: props.scrollElement })
    }
  })

  const wrapper = mount(VisibilityProvider, {
    props: { scrollElement }
  })

  await nextTick()

  const instance = scrollMock.instance
  if (!instance) throw new Error('Virtualizer was not created')

  vi.mocked(scrollElement.scrollTo).mockClear()

  const setVisible = async (visible: boolean) => {
    isVisible.value = visible
    await nextTick()
  }

  return { instance, scrollElement, wrapper, setVisible }
}

describe('ChannelTree scroll correction', () => {
  beforeAll(() => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('iPhone')
  })

  afterAll(() => {
    vi.restoreAllMocks()
  })

  it.each([144, 216])(
    'スクロール位置 %s への移動中に初めて計測した行の差分を、停止後に持ち越さない',
    async offset => {
      const { instance, scrollElement } = await setup()

      scrollElement.scrollTop = offset
      scrollElement.dispatchEvent(new Event('scroll'))

      instance.resizeItem(0, 72)

      await vi.waitFor(() => expect(instance.isScrolling).toBe(false))

      expect(instance.itemSizeCache.get('/0')).toBe(72)
      expect(instance.getTotalSize()).toBe(1836)
      expect(scrollElement.scrollTo).not.toHaveBeenCalled()
    }
  )

  it('停止中に画面より上の行の高さが変わった場合は表示位置を保つ', async () => {
    const { instance, scrollElement } = await setup()

    instance.resizeItem(0, 72)

    await nextTick()

    expect(scrollElement.scrollTop).toBe(216)
    expect(instance.measurementsCache[5]?.start).toBe(216)
  })

  it.each([false, true])(
    '停止中に上方の行の高さが続けて変わっても表示位置を保つ (座標の丸め: %s)',
    async roundOffset => {
      const { instance, scrollElement } = await setup(roundOffset)
      const size = roundOffset ? 72.4 : 72

      instance.resizeItem(0, size)
      await nextTick()

      instance.resizeItem(1, size)
      await nextTick()

      expect(scrollElement.scrollTop).toBe(roundOffset ? 253 : 252)

      expect(
        Math.abs(
          (instance.measurementsCache[5]?.start ?? NaN) -
            scrollElement.scrollTop
        )
      ).toBeLessThanOrEqual(0.5)
    }
  )

  it('位置補正の直後にユーザーがスクロールした場合は高さ変更を補正しない', async () => {
    const { instance, scrollElement } = await setup()

    instance.resizeItem(0, 72)

    scrollElement.scrollTop = 220
    scrollElement.dispatchEvent(new Event('scroll'))
    await nextTick()

    instance.resizeItem(1, 72)

    await vi.waitFor(() => expect(instance.isScrolling).toBe(false))

    expect(scrollElement.scrollTop).toBe(220)
    expect(scrollElement.scrollTo).toHaveBeenCalledTimes(1)
  })

  it('画面より下の行の高さが変わってもスクロール位置を動かさない', async () => {
    const { instance, scrollElement } = await setup()

    instance.resizeItem(30, 72)

    expect(scrollElement.scrollTo).not.toHaveBeenCalled()
  })

  describe('表示状態に応じた計測', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    const measureRow = (
      instance: VueVirtual.Virtualizer<HTMLElement, HTMLElement>,
      size: number
    ) => {
      const element = document.createElement('div')
      element.dataset['index'] = '0'

      const entry = {
        borderBoxSize: [{ inlineSize: 320, blockSize: size }]
      } as unknown as ResizeObserverEntry

      instance.resizeItem(
        0,
        instance.options.measureElement(element, entry, instance)
      )
    }

    it('初期状態が非表示の場合も推定した行の高さを保つ', async () => {
      const { instance, scrollElement } = await setup(false, false)

      measureRow(instance, 0)
      await nextTick()

      expect(instance.measurementsCache[0]?.size).toBe(36)
      expect(instance.getTotalSize()).toBe(1800)
      expect(scrollElement.scrollTo).not.toHaveBeenCalled()
    })

    it.each([false, true])(
      '非表示中と再表示直後は高さを保持し、その後は実測を再開する (計測済み: %s)',
      async measured => {
        const { instance, scrollElement, setVisible } = await setup()

        if (measured) {
          instance.resizeItem(0, 72)
          await nextTick()
        }

        const scrollTop = scrollElement.scrollTop
        const totalSize = instance.getTotalSize()
        vi.mocked(scrollElement.scrollTo).mockClear()

        await setVisible(false)
        measureRow(instance, 0)
        await nextTick()

        expect(instance.getTotalSize()).toBe(totalSize)
        expect(instance.scrollOffset).toBe(scrollTop)

        await setVisible(true)
        measureRow(instance, 0)
        await nextTick()

        expect(instance.measurementsCache[0]?.size).toBe(measured ? 72 : 36)
        expect(instance.getTotalSize()).toBe(totalSize)
        expect(scrollElement.scrollTo).not.toHaveBeenCalled()

        await vi.advanceTimersByTimeAsync(50)
        measureRow(instance, 108)
        await nextTick()

        expect(instance.itemSizeCache.get('/0')).toBe(108)
        expect(scrollElement.scrollTop).toBe(scrollTop + (measured ? 36 : 72))
      }
    )

    it('再表示直後に隠した場合は実測の再開を取り消す', async () => {
      const { instance, scrollElement, setVisible } = await setup()

      await setVisible(false)
      await setVisible(true)
      await setVisible(false)
      await vi.advanceTimersByTimeAsync(50)

      measureRow(instance, 0)
      await nextTick()

      expect(instance.getTotalSize()).toBe(1800)
      expect(instance.scrollOffset).toBe(180)
      expect(scrollElement.scrollTo).not.toHaveBeenCalled()
    })
  })

  describe('タッチ操作中の補正', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it.each([true, false])(
      'タッチ操作中の高さ変更を、指を離した後に持ち越さない (タッチ継続中: %s)',
      async touching => {
        const { instance, scrollElement } = await setup()

        dispatchTouchEvent(scrollElement, 'touchstart')
        scrollElement.scrollTop = 220
        scrollElement.dispatchEvent(new Event('scroll'))

        await vi.advanceTimersByTimeAsync(150)
        expect(instance.isScrolling).toBe(false)

        if (!touching) {
          dispatchTouchEvent(scrollElement, 'touchend')
        }

        instance.resizeItem(0, 72)
        await nextTick()

        expect(instance.itemSizeCache.get('/0')).toBe(72)
        expect(instance.getTotalSize()).toBe(1836)
        expect(scrollElement.scrollTo).not.toHaveBeenCalled()

        if (touching) {
          dispatchTouchEvent(scrollElement, 'touchend')
        }

        await vi.advanceTimersByTimeAsync(150)

        expect(scrollElement.scrollTop).toBe(220)
        expect(scrollElement.scrollTo).not.toHaveBeenCalled()

        instance.resizeItem(1, 72)
        await nextTick()

        expect(scrollElement.scrollTop).toBe(256)
        expect(scrollElement.scrollTo).toHaveBeenCalledTimes(1)
      }
    )

    it('指を離した直後に再び触れた場合は、前の待機時間で補正を再開しない', async () => {
      const { instance, scrollElement } = await setup()

      dispatchTouchEvent(scrollElement, 'touchstart')
      dispatchTouchEvent(scrollElement, 'touchend')
      await vi.advanceTimersByTimeAsync(100)

      dispatchTouchEvent(scrollElement, 'touchstart')
      await vi.advanceTimersByTimeAsync(100)

      instance.resizeItem(0, 72)
      dispatchTouchEvent(scrollElement, 'touchend')
      await vi.advanceTimersByTimeAsync(150)

      expect(scrollElement.scrollTop).toBe(180)
      expect(scrollElement.scrollTo).not.toHaveBeenCalled()
    })

    it.each(['touchend', 'touchcancel'] as const)(
      '一覧の内外を触って内側から指を離しても補正を再開する (外側の終了: %s)',
      async outsideEnd => {
        const { instance, scrollElement } = await setup()
        const outside = document.createElement('div')

        dispatchTouchEvent(outside, 'touchstart', [0])
        dispatchTouchEvent(scrollElement, 'touchstart', [1], [0, 1])
        dispatchTouchEvent(scrollElement, 'touchend', [1], [0])
        dispatchTouchEvent(outside, outsideEnd, [0])

        await vi.advanceTimersByTimeAsync(150)

        instance.resizeItem(0, 72)
        await nextTick()

        expect(scrollElement.scrollTop).toBe(216)
        expect(scrollElement.scrollTo).toHaveBeenCalledTimes(1)
      }
    )

    it.each(['touchend', 'touchcancel'] as const)(
      '一覧内の別々の行を触っている間は補正を保留する (最初の指の終了: %s)',
      async firstEnd => {
        const { instance, scrollElement } = await setup()
        const firstRow = document.createElement('div')
        const secondRow = document.createElement('div')
        scrollElement.append(firstRow, secondRow)

        dispatchTouchEvent(firstRow, 'touchstart', [0])
        dispatchTouchEvent(secondRow, 'touchstart', [1], [0, 1])
        dispatchTouchEvent(firstRow, firstEnd, [0], [1])

        await vi.advanceTimersByTimeAsync(150)

        instance.resizeItem(0, 72)
        await nextTick()

        expect(scrollElement.scrollTo).not.toHaveBeenCalled()

        dispatchTouchEvent(secondRow, 'touchend', [1])
        await vi.advanceTimersByTimeAsync(149)

        instance.resizeItem(1, 72)
        await nextTick()

        expect(scrollElement.scrollTo).not.toHaveBeenCalled()

        await vi.advanceTimersByTimeAsync(1)

        instance.resizeItem(2, 72)
        await nextTick()

        expect(scrollElement.scrollTop).toBe(216)
        expect(scrollElement.scrollTo).toHaveBeenCalledTimes(1)
      }
    )

    it('スクロール要素を差し替えた場合は、新しい要素の停止中の補正を許可する', async () => {
      const { instance, scrollElement, wrapper } = await setup()

      dispatchTouchEvent(scrollElement, 'touchstart')
      const replacement = createScrollElement()
      await wrapper.setProps({ scrollElement: replacement })

      vi.mocked(replacement.scrollTo).mockClear()
      instance.resizeItem(0, 72)
      await nextTick()

      expect(replacement.scrollTop).toBe(216)
      expect(replacement.scrollTo).toHaveBeenCalledTimes(1)

      dispatchTouchEvent(replacement, 'touchstart', [1])
      dispatchTouchEvent(replacement, 'touchend', [1])
      await vi.advanceTimersByTimeAsync(150)

      instance.resizeItem(1, 72)
      await nextTick()

      expect(replacement.scrollTop).toBe(252)
      expect(replacement.scrollTo).toHaveBeenCalledTimes(2)
    })
  })
})
