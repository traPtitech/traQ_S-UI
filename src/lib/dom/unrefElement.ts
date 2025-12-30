import { type MaybeRefOrGetter, toValue } from 'vue'

import { type MaybeElement } from '@vueuse/core'

import { isObjectAndHasKey } from '../basic/object'

export type UnrefElementReturn<T> = T extends { $el: infer E } ? E : T

export const unrefElement = <T extends MaybeElement>(
  elementRef: MaybeRefOrGetter<T>
) => {
  const impl = <T extends MaybeElement>(element: MaybeRefOrGetter<T>) => {
    if (isObjectAndHasKey(element, '$el')) return element.$el
    return element
  }

  return impl(toValue(elementRef)) as UnrefElementReturn<T>
}
