import { type MaybeRefOrGetter, computed, shallowRef, toValue } from 'vue'

import { createSharedComposable, useIntervalFn } from '@vueuse/core'

import { getDateRepresentation } from '/@/lib/basic/date'

const getStartOfDay = (date: Readonly<Date>) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()

const useToday = createSharedComposable(() => {
  const today = shallowRef(0)

  useIntervalFn(
    () => {
      today.value = getStartOfDay(new Date())
    },
    1000,
    { immediateCallback: true }
  )

  return today
})

export const useDateRepresentation = (
  date: MaybeRefOrGetter<Readonly<Date> | string>
) => {
  const today = useToday()

  return computed(() =>
    getDateRepresentation(toValue(date), new Date(today.value))
  )
}
