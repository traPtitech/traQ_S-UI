import originalMitt, { EventHandlerMap, WildcardHandler } from 'mitt'

interface EventMap {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [eventType: string]: (param: any) => void
}

export type TypedMitt<EM extends EventMap> = {
  all: EventHandlerMap
  on<T extends keyof EM>(type: T, handler: EM[T]): void
  on(type: '*', handler: WildcardHandler): void
  off<T extends keyof EM>(type: T, handler: EM[T]): void
  off(type: '*', handler: WildcardHandler): void
  emit<T extends keyof EM>(...type: [T, ...Parameters<EM[T]>]): void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emit(type: '*', event?: any): void
}

export const mitt: <T extends EventMap>(all?: EventHandlerMap) => TypedMitt<T> =
  all => originalMitt(all)
