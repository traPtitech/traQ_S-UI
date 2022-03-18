import { computed, Ref, ref } from 'vue'
import { compareStringInsensitive } from '/@/lib/basic/string'
import { getMatchedWithPriority } from '/@/lib/basic/array'

const useTextFilter = <T, K extends keyof T>(
  items: Ref<readonly T[]>,
  searchTargetKey: T[K] extends string ? K : never
) => {
  // NOTE: stringでなければ呼び出しが通らないのでキャストできる
  const oneLetterItems = computed(() =>
    items.value.filter(
      item => (item[searchTargetKey] as unknown as string).length === 1
    )
  )

  const query = ref('')

  const filteredItems = computed((): readonly T[] => {
    if (query.value.length === 0) {
      return items.value
    }
    const q = query.value.toLowerCase()
    if (q.length === 1) {
      return oneLetterItems.value.filter(
        item => (item[searchTargetKey] as unknown as string).toLowerCase() === q
      )
    }

    const res = getMatchedWithPriority(
      items.value,
      q,
      v => v[searchTargetKey] as unknown as string
    )
    const result = res
      .map(r => ({
        value: r.value,
        sortKey: `${r.priority}${r.value[searchTargetKey]}`
      }))
      .sort((a, b) => compareStringInsensitive(a.sortKey, b.sortKey))
      .map(r => r.value)

    return result
  })

  return { query, filteredItems }
}

export default useTextFilter
