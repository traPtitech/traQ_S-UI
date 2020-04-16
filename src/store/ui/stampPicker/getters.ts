import { defineGetters } from 'direct-vuex'
import { moduleGetterContext } from '@/store'
import { S } from './state'
import { stampPicker } from './index'

const getterContext = (args: [any, any, any, any]) =>
  moduleGetterContext(args, stampPicker)

export const getters = defineGetters<S>()({
  isStampPickerShown(state) {
    return state.targetPortalName.length > 0
  }
})
