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
      if (state.query.length === 1) {
        return oneLetterItems.value.filter(
          item =>
            ((item[searchTargetKey] as unknown) as string)
              .toLowerCase()
              .startsWith(state.query.toLowerCase()) === 0
        )
      }
      return items.value.filter(
        item =>
          ((item[searchTargetKey] as unknown) as string)
            .toLowerCase()
            .indexOf(state.query.toLowerCase()) >= 0
      )
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
