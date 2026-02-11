import type { Invocable } from '/@/types/utility'

export const wait = (ms: number) =>
  new Promise<void>(resolve => {
    setTimeout(() => {
      resolve()
    }, ms)
  })

export const nextFrame = () =>
  new Promise(resolve => {
    requestAnimationFrame(resolve)
  })

export async function defer(): Promise<void>
export async function defer<Fn extends Invocable>(
  callback: Fn
): Promise<Awaited<ReturnType<Fn>>>

export async function defer(callback?: Invocable) {
  await nextFrame()
  await nextFrame()
  return callback?.()
}
