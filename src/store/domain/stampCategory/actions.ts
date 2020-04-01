import { defineActions } from 'direct-vuex'
import {
  constructStampNameIdMap,
  traQStampsToStampCategory,
  categorizeUnicodeStamps
} from '@/lib/stampCategorizer'
import { moduleActionContext } from '@/store'
import { stampCategory } from '.'

const stampCategoryActionContext = (context: any) =>
  moduleActionContext(context, stampCategory)

export const actions = defineActions({
  async constructStampCategories(context) {
    const { commit, rootState } = stampCategoryActionContext(context)
    const { unicodeStampMap, traQStampMap } = constructStampNameIdMap(
      rootState.entities.stamps
    )
    const unicodeStampCategories = await categorizeUnicodeStamps(
      unicodeStampMap
    )
    const traQStampCategory = traQStampsToStampCategory(traQStampMap)
    commit.setTraQStampCategory(traQStampCategory)
    commit.setUnicodeStampCategory(unicodeStampCategories)
  }
})
