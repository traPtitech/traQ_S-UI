import { ResizeObserverWindow } from './types/ResizeObserver'

declare const window: ResizeObserverWindow

export const loadResizeObserver = async () => {
  if (!('ResizeObserver' in window)) {
    const module = await import('@juggle/resize-observer')
    window.ResizeObserver = module.ResizeObserver
  }
}
