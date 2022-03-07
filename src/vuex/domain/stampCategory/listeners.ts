import { createDefineListeners } from '../../utils/defineListeners'
import { entityMitt } from '/@/vuex/entities/mitt'
import { stampCategory } from '.'

export const defineEntityListeners = createDefineListeners<
  typeof stampCategory
>()(entityMitt, (listener, { dispatch }) => {
  listener.on('setStamps', () => {
    dispatch.constructStampCategories()
  })
  listener.on('setStamp', () => {
    dispatch.constructStampCategories()
  })
  listener.on('deleteStamp', () => {
    dispatch.constructStampCategories()
  })
})
