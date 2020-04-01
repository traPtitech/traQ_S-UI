import { defineMutations } from 'direct-vuex'
import { StampCategory } from '@/lib/stampCategorizer'
import { S } from './state'

export const mutations = defineMutations<S>()({
  setTraQStampCategory(state: S, category: StampCategory) {
    state.traQStampCategory = category
  },
  setUnicodeStampCategory(state: S, categories: StampCategory[]) {
    state.unicodeStampCategories = categories
  }
})
