import { reactive, computed, ref } from 'vue'
import { Stamp } from '@traptitech/traq'
import store from '@/_store'
import { compareStringInsensitive } from '@/lib/util/string'
import { getFullMatchedAndMatched } from '@/lib/util/array'
import { StampMap } from '@/_store/entities'

const emojiAltnameTable = import('@/assets/emoji_altname_table.json')

const useStampFilter = () => {
  const stamps = computed(() =>
    Object.values(store.state.entities.stamps as StampMap)
  )
  const stampNames = computed(() => stamps.value.map(stamp => stamp.name))
  const stampsTable = computed(() =>
    Object.fromEntries(stamps.value.map(stamp => [stamp.name, stamp]))
  )

  const altNameTable = ref<Record<string, string>>({})
  const altNames = ref<string[]>([])
  const altNamesToNames = (altNames: string[]) =>
    altNames.map(altName => altNameTable.value[altName])
  emojiAltnameTable.then(
    ({
      altNameTable: strictAltNameTable,
      unicodeTable: strictUnicodeTable
    }) => {
      altNameTable.value = {
        ...strictAltNameTable,
        ...strictUnicodeTable
      }
      altNames.value = [...Object.keys(altNameTable.value)]
    }
  )

  const oneLetterNames = computed(() =>
    stampNames.value.filter(name => name.length === 1)
  )
  const oneLetterAltNames = altNames.value.filter(name => name.length === 1)

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
      } = getFullMatchedAndMatched(altNames.value, query)
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

      return [...new Set([...fullMatchedStamps, ...matchedStamps])]
    })
  })
  return {
    filterState: state
  }
}

export default useStampFilter
