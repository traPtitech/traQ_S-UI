export const wait = (ms: number, signal?: AbortSignal) =>
  new Promise<void>(resolve => {
    if (signal?.aborted) {
      resolve()
      return
    }

    const timeoutId = setTimeout(() => {
      resolve()
    }, ms)

    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timeoutId)
        resolve()
      },
      { once: true }
    )
  })

export const rAF = () =>
  new Promise(resolve => {
    requestAnimationFrame(resolve)
  })
