interface SampleOptions {
  duration?: number
  scrollTo?: number
  scrollDuration?: number
  animation?: {
    direction: 'expand' | 'collapse'
    toggleSelector: string
  }
}

// 仮想スクロールの実装に依存せず表示を検証するため、ブラウザー上で DOM の座標を計測する。
export const sampleRows = async (
  element: HTMLElement,
  options: SampleOptions = {}
) => {
  const read = (time: number) => {
    const bounds = element.getBoundingClientRect()
    const viewport = element.clientHeight

    const rows = [...element.querySelectorAll<HTMLElement>('[data-key]')].map(
      row => {
        const rect = row.getBoundingClientRect()

        let top = rect.top,
          bottom = rect.bottom

        for (
          let parent = row.parentElement;
          parent && parent !== element;
          parent = parent.parentElement
        ) {
          if (/hidden|clip/.test(getComputedStyle(parent).overflowY)) {
            const clip = parent.getBoundingClientRect()
            top = Math.max(top, clip.top)
            bottom = Math.min(bottom, clip.bottom)
          }
        }

        return {
          key: row.dataset['key'] ?? '',
          index: Number(row.dataset['index']),
          top: top - bounds.top,
          bottom: bottom - bounds.top,
          rawTop: rect.top - bounds.top
        }
      }
    )

    // 見出しとマージンによる余白を除いて、行が埋める範囲を求める。
    const content = element.children[1]?.getBoundingClientRect()
    const start = Math.max(0, (content?.top ?? bounds.top) - bounds.top)

    const end = Math.min(
      viewport,
      (element.lastElementChild?.getBoundingClientRect().bottom ?? bounds.top) -
        bounds.top
    )

    let covered = Math.min(start, end),
      gap = 0,
      overlap = 0

    for (const row of rows
      .filter(
        row => row.bottom > start && row.top < end && row.bottom > row.top
      )
      .sort((a, b) => a.top - b.top)) {
      const top = Math.max(row.top, start)
      gap = Math.max(gap, top - covered)
      overlap = Math.max(overlap, covered - top)
      covered = Math.max(covered, Math.min(row.bottom, end))
    }

    gap = Math.max(gap, end - covered)

    return {
      time,
      scrollTop: element.scrollTop,
      scrollHeight: element.scrollHeight,
      rows,
      gap,
      overlap,

      animation:
        element.querySelector<HTMLElement>('[data-direction]')?.dataset[
          'direction'
        ] ?? null
    }
  }

  const initialOffset = element.scrollTop
  const animationTimeout = 2_000
  const frames: ReturnType<typeof read>[] = []
  let startTime = performance.now()

  if (options.animation) {
    const { direction, toggleSelector } = options.animation
    const toggle = element.querySelector<HTMLButtonElement>(toggleSelector)
    if (!toggle) throw new Error(`Missing animation toggle: ${toggleSelector}`)

    await new Promise<void>((resolve, reject) => {
      const observer = new MutationObserver(() => {
        if (element.querySelector(`[data-direction="${direction}"]`)) {
          observer.disconnect()
          clearTimeout(timer)

          startTime = performance.now()
          if (options.scrollTo !== undefined) {
            element.scrollTop = options.scrollTo
            element.dispatchEvent(new Event('scroll'))
          }

          resolve()
        }
      })

      const timer = setTimeout(() => {
        observer.disconnect()
        reject(new Error(`Tree animation did not start: ${direction}`))
      }, animationTimeout)

      observer.observe(element, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['data-direction']
      })

      toggle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    })

    // 開始時の仮想行の更新を待ち、最初の描画フレームより前にも計測する。
    frames.push(read(performance.now() - startTime))
  }

  const duration = options.duration ?? 0
  const scrollDuration = options.scrollDuration ?? 0
  let inputFinished = false

  await new Promise<void>((resolve, reject) => {
    const schedule = () =>
      requestAnimationFrame(() => setTimeout(() => frame(performance.now()), 0))

    const frame = (now: number) => {
      const time = now - startTime
      const sample = read(time)
      frames.push(sample)

      if (
        options.animation &&
        sample.animation !== options.animation.direction
      ) {
        resolve()
        return
      }

      // スクロール位置と DOM の描画を揃えて評価するため、前回の入力に対する
      // スクロールイベントと Vue の描画を待って計測し、その後に次の入力を行う。
      if (
        !options.animation &&
        options.scrollTo !== undefined &&
        !inputFinished
      ) {
        const progress =
          scrollDuration > 0 ? Math.min(1, time / scrollDuration) : 1

        element.scrollTop =
          initialOffset + (options.scrollTo - initialOffset) * progress
        inputFinished = progress === 1
      }

      if (options.animation && time >= animationTimeout) {
        reject(
          new Error(
            `Tree animation did not finish: ${options.animation.direction}`
          )
        )
      } else if (options.animation || time < duration) {
        schedule()
      } else {
        resolve()
      }
    }

    schedule()
  })

  return { frames }
}

export type RowSample = Awaited<ReturnType<typeof sampleRows>>
