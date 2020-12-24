import { defineSubModuleListeners } from '../../utils/defineListeners'
import { entityMitt } from '@/store/entities/mitt'

export const entityListeners = defineSubModuleListeners(
  entityMitt,
  'domain',
  'stampCategory',
  (listener, { dispatch }) => {
    listener.on('setStamps', () => {
      dispatch.constructStampCategories()
    })
    listener.on('setStamp', () => {
      dispatch.constructStampCategories()
    })
    listener.on('deleteStamp', () => {
      dispatch.constructStampCategories()
    })
  }
)
