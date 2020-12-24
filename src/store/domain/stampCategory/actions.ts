import { defineActions } from 'direct-vuex'
import {
  constructStampNameIdMap,
  traQStampsToStampCategory,
  categorizeUnicodeStamps
} from '@/lib/stampCategorizer'
import { moduleActionContext } from '@/store'
import { stampCategory } from '.'
import { ActionContext } from 'vuex'

const stampCategoryActionContext = (context: ActionContext<unknown, unknown>) =>
  moduleActionContext(context, stampCategory)

export const actions = defineActions({
  async constructStampCategories(context) {
    const { rootState, commit } = stampCategoryActionContext(context)
    const { unicodeStampMap, traQStampMap } = constructStampNameIdMap(
      rootState.entities.stampsMap
    )
    const unicodeStampCategories = await categorizeUnicodeStamps(
      unicodeStampMap
    )
    const traQStampCategory = traQStampsToStampCategory(traQStampMap)
    commit.setTraQStampCategory(traQStampCategory)
    commit.setUnicodeStampCategory(unicodeStampCategories)
  }
})
