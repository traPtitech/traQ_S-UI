import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/store'
import { stampPicker, Place } from '.'
import { StampSelectHandler } from './state'
import { ActionContext } from 'vuex'

export const stampPickerActionContext = (
  context: ActionContext<unknown, unknown>
) => moduleActionContext(context, stampPicker)

export const actions = defineActions({
  openStampPicker(
    context,
    payload: {
      teleportTargetName: string
      selectHandler: StampSelectHandler
      position?: Place
    }
  ) {
    const { commit } = stampPickerActionContext(context)
    commit.setTeleportTargetName(payload.teleportTargetName)
    commit.setSelectHandler(payload.selectHandler)
    commit.setPosition(payload.position)
  },
  closeStampPicker(context) {
    const { commit } = stampPickerActionContext(context)
    commit.clearTeleportTargetName()
    commit.clearSelectHandler()
    commit.clearPosition()
  }
})
