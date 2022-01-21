import originalMitt, { EventHandlerMap, WildcardHandler } from 'mitt'

interface EventMap {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [eventType: string | symbol]: (param: any) => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventsFromEventMap<T extends EventMap> = T extends any
  ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any
  : {
      [P in keyof T]: Parameters<T[P]>[0]
    }

export type TypedMitt<EM extends EventMap> = {
  all: EventHandlerMap<EventsFromEventMap<EM>>
  on<T extends keyof EM>(type: T, handler: EM[T]): void
  on(type: '*', handler: WildcardHandler<EventsFromEventMap<EM>>): void
  off<T extends keyof EM>(type: T, handler: EM[T]): void
  off(type: '*', handler: WildcardHandler<EventsFromEventMap<EM>>): void
  emit<T extends keyof EM>(type: T, ...event: Parameters<EM[T]>): void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emit(type: '*', event?: any): void
}

export const mitt: <T extends EventMap>(
  all?: EventHandlerMap<EventsFromEventMap<T>>
) => TypedMitt<T> = all => originalMitt(all)
