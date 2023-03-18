import { ref } from 'vue'
import useTextFilter from '/@/composables/utils/useTextFilter'

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
    const { query, filteredItems } = useTextFilter(items, ['name'])
    expect(query.value).toBe('')
    expect(filteredItems.value).toStrictEqual(defaultItems)
  })

  it.concurrent('one letter items', () => {
    const items = ref(defaultItems)
    const { query, filteredItems } = useTextFilter(items, ['name'])
    query.value = 'a'
    expect(filteredItems.value).toStrictEqual([{ name: 'a' }])
  })

  it.concurrent('priority', () => {
    const items = ref(defaultItems)
    const { query, filteredItems } = useTextFilter(items, ['name'])
    query.value = 'ab'
    expect(filteredItems.value).toStrictEqual([
      { name: 'ab' }, // full match
      { name: 'abb' }, // match
      { name: 'bab' } // match
    ])
  })

  it.concurrent('sorted', () => {
    const items = ref([{ name: 'cbc' }, { name: 'abc' }])
    const { query, filteredItems } = useTextFilter(items, ['name'])
    query.value = 'bc'
    expect(filteredItems.value).toStrictEqual([
      { name: 'abc' }, // match
      { name: 'cbc' } // match
    ])
  })

  it.concurrent('items is reactive', () => {
    const items = ref([...defaultItems])
    const { query, filteredItems } = useTextFilter(items, ['name'])
    query.value = 'abb'
    expect(filteredItems.value).toStrictEqual([{ name: 'abb' }])
    items.value.push({ name: 'abbb' })
    expect(filteredItems.value).toStrictEqual([
      { name: 'abb' },
      { name: 'abbb' }
    ])
  })
})
