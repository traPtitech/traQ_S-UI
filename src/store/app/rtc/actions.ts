import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/store'
import { rtc } from './index'

export const rtcActionContext = (context: any) =>
  moduleActionContext(context, rtc)

export const actions = defineActions({})
