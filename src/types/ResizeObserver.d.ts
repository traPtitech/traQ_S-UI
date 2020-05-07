import type { ResizeObserver } from '@juggle/resize-observer'

interface Window {
  ResizeObserver: typeof ResizeObserver
}
export type ResizeObserverWindow = Window & typeof globalThis
