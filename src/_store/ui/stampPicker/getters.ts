import { defineGetters } from 'direct-vuex'
import { moduleGetterContext } from '@/_store'
import { S } from './state'
import { stampPicker } from './index'

const getterContext = (args: [unknown, unknown, unknown, unknown]) =>
  moduleGetterContext(args, stampPicker)

export const getters = defineGetters<S>()({
  isStampPickerShown(state) {
    return state.position !== undefined
  }
})
