import { reactive, computed } from '@vue/composition-api'
import { Stamp } from '@traptitech/traq'
import {
  altNameTable as strictAltNameTable,
  unicodeTable as strictUnicodeTable
} from '@/assets/emoji_altname_table.json'
import store from '@/store'
import { compareStringInsensitive } from '@/lib/util/string'
import { getFullMatchedAndMatched } from '@/lib/util/array'
import { StampMap } from '@/store/entities'

const useStampFilter = () => {
  const stamps = computed(() =>
    Object.values(store.state.entities.stamps as StampMap)
  )
  const stampNames = computed(() => stamps.value.map(stamp => stamp.name))
  const stampsTable = computed(() =>
    Object.fromEntries(stamps.value.map(stamp => [stamp.name, stamp]))
  )

  const altNameTable: Record<string, string> = {
    ...strictAltNameTable,
    ...strictUnicodeTable
  }
  const altNames = [...Object.keys(altNameTable)]
  const altNamesToNames = (altNames: string[]) =>
    altNames.map(altName => altNameTable[altName])

  const oneLetterNames = computed(() =>
    stampNames.value.filter(name => name.length === 1)
  )
  const oneLetterAltNames = altNames.filter(name => name.length === 1)

  const getSortedStamps = (stampNames: Iterable<string>) => {
    return [...new Set(stampNames)]
      .sort(compareStringInsensitive)
      .map(name => stampsTable.value[name])
  }

  const state = reactive({
    query: '',
    filteredItems: computed((): readonly Stamp[] => {
      if (state.query.length === 0) {
        return stamps.value
      }

      const query = state.query.toLowerCase()
      if (state.query.length === 1) {
        const altNameMatched = oneLetterAltNames.filter(
          altName => altName.toLowerCase() === query
        )
        const matched = oneLetterNames.value.filter(
          name => name.toLowerCase() === query
        )
        return getSortedStamps([...altNamesToNames(altNameMatched), ...matched])
      }

      const {
        fullMatched: altNameFullMatched,
        matched: altNameMatched
      } = getFullMatchedAndMatched(altNames, query)
      const { fullMatched, matched } = getFullMatchedAndMatched(
        stampNames.value,
        query
      )

      const fullMatchedStamps = getSortedStamps([
        ...altNamesToNames(altNameFullMatched),
        ...fullMatched
      ])
      const matchedStamps = getSortedStamps([
        ...altNamesToNames(altNameMatched),
        ...matched
      ])

      return [...fullMatchedStamps, ...matchedStamps]
    })
  })
  const setQuery = (query: string) => {
    state.query = query
  }
  return {
    filterState: state,
    setQuery
  }
}

export default useStampFilter
