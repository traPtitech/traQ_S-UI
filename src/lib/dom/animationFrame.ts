export const createAnimationFrameController = () => {
  let frameId: number | null = null

  return {
    request(callback: FrameRequestCallback) {
      if (frameId !== null) window.cancelAnimationFrame(frameId)
      frameId = window.requestAnimationFrame(callback)
    },

    cancel() {
      if (frameId === null) return
      window.cancelAnimationFrame(frameId)
      frameId = null
    },

    get isActive() {
      return frameId !== null
    }
  }
}
