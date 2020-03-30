import { reactive, computed, Ref } from '@vue/composition-api'

const useTextFilter = <T, K extends keyof T>(
  items: Ref<readonly T[]>,
  searchTargetKey: T[K] extends string ? K : never
) => {
  const state = reactive({
    query: '',
    filteredItems: computed((): readonly T[] => {
      // TODO: 1文字完全一致のみの対応
      if (state.query.length === 0) {
        return items.value
      } else {
        return items.value.filter(
          // NOTE: stringでなければ通らないのでキャストしてしまう
          item =>
            ((item[searchTargetKey] as unknown) as string)?.indexOf(
              state.query
            ) >= 0
        )
      }
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
