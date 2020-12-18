import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/_store'
import { messageContextMenu } from './index'
import { MessageId } from '@/types/entity-ids'
import { ActionContext } from 'vuex'

export const messageContextMenuActionContext = (
  context: ActionContext<unknown, unknown>
) => moduleActionContext(context, messageContextMenu)

export const actions = defineActions({
  openMessageContextMenu(
    context,
    payload: { messageId: MessageId; x: number; y: number; isMinimum?: boolean }
  ) {
    const { commit } = messageContextMenuActionContext(context)
    commit.setTarget(payload.messageId)
    commit.setPosition({ x: payload.x, y: payload.y })
    commit.setIsMinimum(payload.isMinimum ?? false)
  },
  closeMessageContextMenu(context) {
    const { commit } = messageContextMenuActionContext(context)
    commit.initPosition()
    commit.initTarget()
    commit.initIsMinimum()
  },
  setPosition(context, payload: { x: number; y: number }) {
    const { commit } = messageContextMenuActionContext(context)
    commit.setPosition({ x: payload.x, y: payload.y })
  }
})
