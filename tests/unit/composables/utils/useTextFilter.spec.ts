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

  const defaultItemsWithMultipleKeys = [
    { name: 'a', displayName: 'a' },
    { name: 'bb', displayName: 'b' },
    { name: 'c', displayName: 'cc' },
    { name: 'aa', displayName: 'aab' },
    { name: 'aab', displayName: 'aab' },
    { name: 'baa', displayName: 'ba' }
  ]

  it.concurrent('multiple keys: one letter items', () => {
    const items = ref(defaultItemsWithMultipleKeys)
    const { query, filteredItems } = useTextFilter(items, [
      'name',
      'displayName'
    ])
    query.value = 'a'
    expect(filteredItems.value).toStrictEqual([{ name: 'a', displayName: 'a' }])
    query.value = 'b'
    expect(filteredItems.value).toStrictEqual([
      { name: 'bb', displayName: 'b' }
    ])
  })

  it.concurrent('multiple keys: priority', () => {
    const items = ref(defaultItemsWithMultipleKeys)
    const { query, filteredItems } = useTextFilter(items, [
      'name',
      'displayName'
    ])
    query.value = 'aa'
    expect(filteredItems.value).toStrictEqual([
      { name: 'aa', displayName: 'aab' }, // full match (and prefix match, but only the highest priority is used)
      { name: 'aab', displayName: 'aab' }, // prefix match
      { name: 'baa', displayName: 'ba' } // partial match
    ])
  })

  it.concurrent('multiple keys: sorted', () => {
    const items = ref([
      { name: 'a', displayName: 'cbc' },
      { name: 'abc', displayName: 'b' }
    ])
    const { query, filteredItems } = useTextFilter(items, [
      'name',
      'displayName'
    ])
    query.value = 'bc'
    expect(filteredItems.value).toStrictEqual([
      { name: 'abc', displayName: 'b' }, // partial match
      { name: 'a', displayName: 'cbc' } // partial match
    ])
  })
})
