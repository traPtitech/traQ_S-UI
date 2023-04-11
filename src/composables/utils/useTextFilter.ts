import type { Ref } from 'vue'
import { computed, ref } from 'vue'
import { getMatchedWithPriority } from '/@/lib/basic/array'
import { compareStringInsensitive } from '/@/lib/basic/string'

const useTextFilter = <T, K extends keyof T>(
  items: Ref<readonly T[]>,
  searchTargetKeys: (T[K] extends string ? K : never)[],
  options?: Partial<{
    limit: number
  }>
) => {
  // NOTE: stringでなければ呼び出しが通らないのでキャストできる
  const oneLetterItems = computed(() =>
    items.value.filter(item =>
      searchTargetKeys.some(
        key => (item[key] as unknown as string).length === 1
      )
    )
  )

  const query = ref('')

  const filteredItems = computed((): readonly T[] => {
    if (query.value.length === 0) {
      return items.value
    }
    const q = query.value.toLowerCase()
    if (q.length === 1) {
      return oneLetterItems.value.filter(item =>
        searchTargetKeys.some(
          key => (item[key] as unknown as string).toLowerCase() === q
        )
      )
    }

    const res = getMatchedWithPriority(items.value, q, v =>
      searchTargetKeys.map(k => v[k] as unknown as string)
    )
    const result = res
      .map(r => ({
        value: r.value,
        sortKey: `${r.priority}${searchTargetKeys
          .map(k => r.value[k])
          .join('')}`
      }))
      .sort((a, b) => compareStringInsensitive(a.sortKey, b.sortKey))
      .map(r => r.value)

    if (options?.limit !== undefined) {
      return result.slice(0, options?.limit)
    }

    return result
  })

  return { query, filteredItems }
}

export default useTextFilter
