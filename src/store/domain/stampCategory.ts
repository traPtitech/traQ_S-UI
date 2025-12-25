import { ref, toRaw } from 'vue'

import { acceptHMRUpdate, defineStore } from 'pinia'

import type { StampCategory } from '/@/lib/stampCategorizer'
import {
  categorizeUnicodeStamps,
  constructStampNameIdMap,
  traQStampsToStampCategory
} from '/@/lib/stampCategorizer'
import { entityMitt } from '/@/store/entities/mitt'
import { useStampsStore } from '/@/store/entities/stamps'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'

const useStampCategoryPinia = defineStore('domain/stampCategory', () => {
  const stampsStore = useStampsStore()

  const traQStampCategory = ref<Readonly<StampCategory>>({
    name: 'traq',
    stampIds: []
  })
  const unicodeStampCategories = ref<readonly StampCategory[]>([])

  const constructStampCategories = async () => {
    const { unicodeStampMap, traQStampMap } = constructStampNameIdMap(
      // reactiveのままだとiterateするのが遅くなるのでtoRawで生の値を取り出す
      toRaw(stampsStore.stampsMap.value)
    )
    traQStampCategory.value = traQStampsToStampCategory(traQStampMap)
    unicodeStampCategories.value =
      await categorizeUnicodeStamps(unicodeStampMap)
  }

  constructStampCategories()
  entityMitt.on('setStamps', () => {
    constructStampCategories()
  })
  entityMitt.on('setStamp', () => {
    constructStampCategories()
  })
  entityMitt.on('deleteStamp', () => {
    constructStampCategories()
  })

  return { traQStampCategory, unicodeStampCategories }
})

export const useStampCategory = convertToRefsStore(useStampCategoryPinia)

if (import.meta.hot) {
  import.meta.hot.accept(
    acceptHMRUpdate(useStampCategoryPinia, import.meta.hot)
  )
}
