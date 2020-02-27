import { createActions } from 'direct-vuex'
import { moduleActionContext } from '@/store'
import { messageContextMenu } from './index'

export const messageContextMenuActionContext = (context: any) =>
  moduleActionContext(context, messageContextMenu)

export const actions = createActions({})
