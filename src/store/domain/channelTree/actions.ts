import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/store'
import { channelTree } from './index'

export const channelTreeActionContext = (context: any) =>
  moduleActionContext(context, channelTree)

export const actions = defineActions({})
