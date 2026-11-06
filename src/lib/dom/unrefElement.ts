import { type MaybeRefOrGetter, toValue } from 'vue'

import { type MaybeElement } from '@vueuse/core'

import { isObjectAndHasKey } from '../basic/object'

type ElementSource = MaybeElement | { readonly $el: ElementSource }

export type UnrefElementReturn<T> = T extends { $el: infer E } ? E : T

export const unrefElement = <T extends ElementSource>(
  source: MaybeRefOrGetter<T>
): UnrefElementReturn<T> => {
  const value = toValue(source)

  return (
    isObjectAndHasKey(value, '$el') ? value.$el : value
  ) as UnrefElementReturn<T>
}
