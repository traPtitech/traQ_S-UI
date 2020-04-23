import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/store'
import { stampPicker } from './index'
import { StampSelectHandler, defaultSelectHandler } from './state'

export const stampPickerActionContext = (context: any) =>
  moduleActionContext(context, stampPicker)

export const actions = defineActions({
  openStampPicker(
    context,
    payload: { targetPortalName: string; selectHandler: StampSelectHandler }
  ) {
    const { commit } = stampPickerActionContext(context)
    commit.setTargetPortalName(payload.targetPortalName)
    commit.setSelectHandler(payload.selectHandler)
  },
  openMessageStampPicker(
    context,
    payload: {
      targetPortalName: string
      selectHandler: StampSelectHandler
      position: { x: number; y: number }
    }
  ) {
    const { commit } = stampPickerActionContext(context)
    commit.setTargetPortalName(payload.targetPortalName)
    commit.setSelectHandler(payload.selectHandler)
    commit.setPosition(payload.position)
  },
  closeStampPicker(context) {
    const { commit } = stampPickerActionContext(context)
    commit.setTargetPortalName('')
    commit.setSelectHandler(defaultSelectHandler)
    commit.initPosition()
  }
})
