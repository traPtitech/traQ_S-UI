import { ref } from 'vue'
import useTextFilter from '/@/composables/useTextFilter'

describe('useTextFilter', () => {
  const defaultItems = [
    { name: 'a' },
    { name: 'ab' },
    { name: 'abb' },
    { name: 'bab' },
    { name: 'c' }
  ]

  it.concurrent('initial value', () => {
    const items = ref(defaultItems)
    const { textFilterState } = useTextFilter(items, 'name')
    expect(textFilterState).toStrictEqual({
      query: '',
      filteredItems: defaultItems
    })
  })

  it.concurrent('one letter items', () => {
    const items = ref(defaultItems)
    const { textFilterState, setQuery } = useTextFilter(items, 'name')
    setQuery('a')
    expect(textFilterState.filteredItems).toStrictEqual([{ name: 'a' }])
  })

  it.concurrent('priority', () => {
    const items = ref(defaultItems)
    const { textFilterState, setQuery } = useTextFilter(items, 'name')
    setQuery('ab')
    expect(textFilterState.filteredItems).toStrictEqual([
      { name: 'ab' }, // full match
      { name: 'abb' }, // match
      { name: 'bab' } // match
    ])
  })

  it.concurrent('items is reactive', () => {
    const items = ref([...defaultItems])
    const { textFilterState, setQuery } = useTextFilter(items, 'name')
    setQuery('ab')
    items.value.push({ name: 'abbb' })
    expect(textFilterState.filteredItems).toContainEqual({ name: 'abbb' })
  })
})
