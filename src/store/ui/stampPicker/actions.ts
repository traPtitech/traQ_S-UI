import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/store'
import { stampPicker, Place } from '.'
import { StampSelectHandler } from './state'

export const stampPickerActionContext = (context: any) =>
  moduleActionContext(context, stampPicker)

export const actions = defineActions({
  openStampPicker(
    context,
    payload: {
      targetPortalName: string
      selectHandler: StampSelectHandler
      position?: Place
    }
  ) {
    const { commit } = stampPickerActionContext(context)
    commit.setTargetPortalName(payload.targetPortalName)
    commit.setSelectHandler(payload.selectHandler)
    commit.setPosition(payload.position)
  },
  closeStampPicker(context) {
    const { commit } = stampPickerActionContext(context)
    commit.clearTargetPortalName()
    commit.clearSelectHandler()
    commit.clearPosition()
  }
})
