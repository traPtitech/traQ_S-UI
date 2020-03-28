import { reactive, computed, Ref } from '@vue/composition-api'

type Matchable = {
  id: string
  [x: string]: string
}

const useRegexpFilter = <T extends Matchable, K extends keyof T>(
  items: Ref<T[]>,
  searchTargetKey: K
) => {
  const state = reactive({
    query: '',
    filteredItems: computed((): T[] =>
      items.value.filter(
        item => item[searchTargetKey].match(state.query) !== null
      )
    )
  })
  const setQuery = (query: string) => {
    state.query = query
    console.log(state.filteredItems)
  }
  return {
    regexpFilterState: state,
    setQuery
  }
}

export default useRegexpFilter
