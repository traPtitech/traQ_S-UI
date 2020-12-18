import { defineActions } from 'direct-vuex'
import {
  constructStampNameIdMap,
  traQStampsToStampCategory,
  categorizeUnicodeStamps
} from '@/lib/stampCategorizer'
import { moduleActionContext } from '@/_store'
import { stampCategory } from '.'
import { ActionContext } from 'vuex'
import { StampMap } from '@/_store/entities'

const stampCategoryActionContext = (context: ActionContext<unknown, unknown>) =>
  moduleActionContext(context, stampCategory)

export const actions = defineActions({
  async constructStampCategories(context) {
    const { commit, rootState } = stampCategoryActionContext(context)
    const { unicodeStampMap, traQStampMap } = constructStampNameIdMap(
      rootState.entities.stamps as StampMap
    )
    const unicodeStampCategories = await categorizeUnicodeStamps(
      unicodeStampMap
    )
    const traQStampCategory = traQStampsToStampCategory(traQStampMap)
    commit.setTraQStampCategory(traQStampCategory)
    commit.setUnicodeStampCategory(unicodeStampCategories)
  }
})
