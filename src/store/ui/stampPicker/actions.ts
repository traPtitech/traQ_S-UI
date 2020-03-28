import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/store'
import { stampPicker } from './index'
import { StampSelectHandler } from './state'

export const stampPickerActionContext = (context: any) =>
  moduleActionContext(context, stampPicker)

export const actions = defineActions({
  showStampPicker(
    context,
    payload: { targetPortalName: string; selectHandler: StampSelectHandler }
  ) {
    const { commit } = stampPickerActionContext(context)
    commit.setTargetPortalName(payload.targetPortalName)
    commit.setSelectHandler(payload.selectHandler)
  }
})
