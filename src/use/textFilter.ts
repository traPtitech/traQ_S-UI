import { reactive, computed, Ref } from '@vue/composition-api'

const useTextFilter = <T, K extends keyof T>(
  items: Ref<readonly T[]>,
  searchTargetKey: T[K] extends string ? K : never
) => {
  // NOTE: stringでなければ呼び出しが通らないのでキャストできる
  const oneLetterItems = computed(() =>
    items.value.filter(
      item => ((item[searchTargetKey] as unknown) as string).length === 1
    )
  )
  const state = reactive({
    query: '',
    filteredItems: computed((): readonly T[] => {
      if (state.query.length === 0) {
        return items.value
      }
      const query = state.query.toLowerCase()
      if (state.query.length === 1) {
        return oneLetterItems.value.filter(
          item =>
            ((item[searchTargetKey] as unknown) as string).toLowerCase() ===
            query
        )
      }

      let fullMatched: T[] | undefined
      const matched: T[] = []
      for (const item of items.value) {
        const keyValue = ((item[
          searchTargetKey
        ] as unknown) as string).toLowerCase()
        if (keyValue === query) {
          fullMatched ? fullMatched.push(item) : (fullMatched = [item])
        } else if (keyValue.includes(query)) {
          matched.push(item)
        }
      }
      return fullMatched ? [...fullMatched, ...matched] : matched
    })
  })
  const setQuery = (query: string) => {
    state.query = query
  }
  return {
    textFilterState: state,
    setQuery
  }
}

export default useTextFilter
