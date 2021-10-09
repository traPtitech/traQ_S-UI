export const wait = (ms: number) =>
  new Promise<void>(resolve => {
    setTimeout(() => {
      resolve()
    }, ms)
  })

export const rAF = () =>
  new Promise(resolve => {
    requestAnimationFrame(resolve)
  })
