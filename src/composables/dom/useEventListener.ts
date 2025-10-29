import {
  computed,
  onScopeDispose,
  toValue,
  unref,
  watch,
  type MaybeRef,
  type MaybeRefOrGetter
} from 'vue'
import type { Invocable, MaybeArray } from '/@/types/utility'
import { toArray } from '/@/lib/basic/array'
import { unrefElement } from '/@/lib/dom/unrefElement'

type Targetable = Window | Document | ShadowRoot | HTMLElement | MediaQueryList

type WindowEventName = keyof WindowEventMap
type DocumentEventName = keyof DocumentEventMap
type ShadowRootEventName = keyof ShadowRootEventMap
type MediaQueryListEventName = keyof MediaQueryListEventMap

type EventNames<Target> = Target extends Window
  ? WindowEventName
  : Target extends Document
    ? DocumentEventName
    : Target extends ShadowRoot
      ? ShadowRootEventName
      : Target extends MediaQueryList
        ? MediaQueryListEventName
        : string

interface EventListenerType<E extends Event = Event> {
  (evt: E): void
}

const useEventListener = <
  Target extends Targetable,
  EventType extends Event = Event
>(
  _targets: MaybeRefOrGetter<MaybeArray<Target> | null | undefined>,
  _events: MaybeRefOrGetter<MaybeArray<EventNames<Target>>>,
  _handlers: MaybeRef<MaybeArray<EventListenerType<EventType>>>,
  options?: MaybeRefOrGetter<boolean | AddEventListenerOptions>
) => {
  const targets = computed(() =>
    toArray(toValue(_targets))
      .map(unrefElement)
      .filter(e => !!e)
  )

  const events = computed(() => toArray(toValue(_events)))
  const handlers = computed(() => toArray(unref(_handlers)))

  const cleanups: Invocable[] = []

  const cleanup = () => {
    cleanups.forEach(cleanup => cleanup())
    cleanups.length = 0
  }

  const stopWatch = watch(
    () =>
      [targets.value, events.value, handlers.value, toValue(options)] as const,
    ([targets, events, handlers, options]) => {
      cleanup()

      if (!targets || !events || !handlers) return

      const clonedOptions = structuredClone(options)

      cleanups.push(
        ...targets.flatMap(target =>
          events.flatMap(event =>
            handlers.map((handler: Invocable) => {
              target.addEventListener(event, handler, clonedOptions)

              return () =>
                target.removeEventListener(event, handler, clonedOptions)
            })
          )
        )
      )
    },
    { immediate: true, flush: 'post' }
  )

  onScopeDispose(cleanup, true)

  return () => {
    stopWatch()
    cleanup()
  }
}

export default useEventListener
