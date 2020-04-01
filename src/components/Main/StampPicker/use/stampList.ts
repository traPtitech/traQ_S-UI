import { computed, Ref } from '@vue/composition-api'
import store from '@/store'
import { StampId } from '@/types/entity-ids'
import { StampSet } from './stampSetSelector'
import { Stamp } from '@traptitech/traq'

const useStampList = (currentStampSet: Ref<StampSet>) => {
  const stampIds = computed((): StampId[] => {
    if (currentStampSet.value.type === 'history') {
      return store.getters.domain.me.recentStampIds
    }
    if (currentStampSet.value.type === 'palette') {
      const id = currentStampSet.value.id
      const stampPalette = store.state.entities.stampPalettes[id]
      return stampPalette?.stamps ?? []
    }
    if (currentStampSet.value.type === 'category') {
      const traQStampCategory =
        store.state.domain.stampCategory.traQStampCategory
      const unicodeStampCategories =
        store.state.domain.stampCategory.unicodeStampCategories
      const name = currentStampSet.value.id
      if (name === traQStampCategory.name) {
        return traQStampCategory.stampIds
      }
      return (
        unicodeStampCategories.find(
          category => name === `unicode-${category.name}`
        )?.stampIds ?? []
      )
    }
    return []
  })
  const stamps = computed((): Stamp[] =>
    stampIds.value.map(id => store.state.entities.stamps[id])
  )
  return { stamps }
}

export default useStampList
