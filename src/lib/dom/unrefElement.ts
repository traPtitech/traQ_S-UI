import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'

import { isObjectAndHasKey } from '../basic/object'

export type UnrefElementReturn<T> = T extends { $el: infer E } ? E : T

export function unrefElement<T>(element: MaybeRefOrGetter<T>) {
  const plain = toValue(element)
  return (
    isObjectAndHasKey(plain, '$el') ? plain.$el : plain
  ) as UnrefElementReturn<T>
}
