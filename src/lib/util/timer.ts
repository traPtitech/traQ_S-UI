export const rAF = () =>
  new Promise(resolve => {
    requestAnimationFrame(resolve)
  })
