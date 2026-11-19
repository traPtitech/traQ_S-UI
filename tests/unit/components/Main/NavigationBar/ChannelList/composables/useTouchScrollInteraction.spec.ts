import { effectScope, nextTick, ref } from 'vue'

import useTouchScrollInteraction from '/@/components/Main/NavigationBar/ChannelList/composables/useTouchScrollInteraction'

const SETTLE_DELAY_MS = 150

const dispatchTouchEvent = (
  target: EventTarget,
  type: 'touchstart' | 'touchend' | 'touchcancel',
  identifiers = [0]
) => {
  target.dispatchEvent(
    new TouchEvent(type, {
      bubbles: true,
      changedTouches: identifiers.map(
        identifier => ({ identifier, target }) as Touch
      )
    })
  )
}

describe('useTouchScrollInteraction', () => {
  let scope: ReturnType<typeof effectScope>

  beforeEach(() => {
    vi.useFakeTimers()
    scope = effectScope()
  })

  afterEach(() => {
    scope.stop()
    vi.useRealTimers()
  })

  const setup = () => {
    const scrollElement = ref(document.createElement('div'))

    const interaction = scope.run(() => {
      const interaction = useTouchScrollInteraction(
        scrollElement,
        SETTLE_DELAY_MS
      )

      interaction.observe()
      return interaction
    })
    if (!interaction) throw new Error('Touch interaction was not created')

    const row = document.createElement('div')
    scrollElement.value.append(row)

    return { interaction, scrollElement, row }
  }

  it.each(['touchend', 'touchcancel'] as const)(
    '開始先の行が削除されても操作を終了する (%s)',
    async endEvent => {
      const { interaction, row, scrollElement } = setup()

      dispatchTouchEvent(row, 'touchstart')
      row.remove()
      dispatchTouchEvent(row, endEvent)

      await vi.advanceTimersByTimeAsync(SETTLE_DELAY_MS - 1)
      expect(interaction.isActive()).toBe(true)

      await vi.advanceTimersByTimeAsync(1)
      expect(interaction.isActive()).toBe(false)

      dispatchTouchEvent(scrollElement.value, 'touchstart', [1])
      dispatchTouchEvent(scrollElement.value, 'touchend', [1])
      await vi.advanceTimersByTimeAsync(SETTLE_DELAY_MS)

      expect(interaction.isActive()).toBe(false)
    }
  )

  it('同じ行への複数のタッチがすべて終了するまで操作中として扱う', async () => {
    const { interaction, row } = setup()

    dispatchTouchEvent(row, 'touchstart', [0, 1])
    row.remove()
    dispatchTouchEvent(row, 'touchend', [0])
    await vi.advanceTimersByTimeAsync(SETTLE_DELAY_MS)

    expect(interaction.isActive()).toBe(true)

    dispatchTouchEvent(row, 'touchend', [1])
    await vi.advanceTimersByTimeAsync(SETTLE_DELAY_MS)

    expect(interaction.isActive()).toBe(false)
  })

  it('スクロール要素の差し替え後は、以前の行の終了イベントで新しい操作を終了しない', async () => {
    const { interaction, row, scrollElement } = setup()

    dispatchTouchEvent(row, 'touchstart')
    row.remove()
    scrollElement.value = document.createElement('div')
    await nextTick()

    expect(interaction.isActive()).toBe(false)

    dispatchTouchEvent(scrollElement.value, 'touchstart')
    dispatchTouchEvent(row, 'touchend')
    await vi.advanceTimersByTimeAsync(SETTLE_DELAY_MS)

    expect(interaction.isActive()).toBe(true)

    dispatchTouchEvent(scrollElement.value, 'touchend')
    await vi.advanceTimersByTimeAsync(SETTLE_DELAY_MS)

    expect(interaction.isActive()).toBe(false)
  })

  it('破棄時に行の監視と終了待機を解除する', () => {
    const { interaction, row } = setup()

    dispatchTouchEvent(row, 'touchstart')
    row.remove()
    scope.stop()
    dispatchTouchEvent(row, 'touchend')

    expect(interaction.isActive()).toBe(false)
    expect(vi.getTimerCount()).toBe(0)
  })
})
