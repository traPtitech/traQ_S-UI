import { effectScope, nextTick, ref } from 'vue'
import type { Ref } from 'vue'

import useScrollMargins from '/@/components/Main/NavigationBar/NavigationContent/composables/useScrollMargins'

const { useElementSize } = vi.hoisted(() => ({ useElementSize: vi.fn() }))
vi.mock('@vueuse/core', () => ({ useElementSize }))

describe('useScrollMargins', () => {
  it('前のセクションの高さの変化と追加・削除を後続リストの開始位置に反映する', async () => {
    const title = ref(document.createElement('div'))
    const optionalSection = ref<HTMLElement | null>(
      document.createElement('div')
    )

    const list = ref(document.createElement('div'))
    const listHeight = ref(360)
    const heights = new Map<Readonly<Ref<HTMLElement | null>>, Ref<number>>([
      [title, ref(60)],
      [optionalSection, ref(120)],
      [list, listHeight]
    ])

    useElementSize.mockImplementation(
      (target: Readonly<Ref<HTMLElement | null>>) => ({
        height: heights.get(target)
      })
    )

    const scope = effectScope()
    const margins = scope.run(() =>
      useScrollMargins({
        home: [title],
        channels: [optionalSection],
        qall: [list]
      })
    )

    if (!margins) throw new Error('Scroll margin scope is inactive')

    try {
      expect(margins.value).toEqual({ home: 60, channels: 180, qall: 540 })

      listHeight.value = 720
      await nextTick()
      expect(margins.value).toEqual({ home: 60, channels: 180, qall: 900 })

      optionalSection.value = null
      await nextTick()
      expect(margins.value).toEqual({ home: 60, channels: 60, qall: 780 })

      optionalSection.value = document.createElement('div')
      await nextTick()
      expect(margins.value).toEqual({ home: 60, channels: 180, qall: 900 })

      // タブ全体が v-show で隠れても、直前の開始位置を保持する。
      for (const height of heights.values()) height.value = 0
      await nextTick()
      expect(margins.value).toEqual({ home: 60, channels: 180, qall: 900 })
    } finally {
      scope.stop()
    }
  })
})
