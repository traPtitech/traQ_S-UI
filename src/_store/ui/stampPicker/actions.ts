import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/_store'
import { stampPicker, Place } from '.'
import { PositionOf, StampSelectHandler } from './state'
import { ActionContext } from 'vuex'

export const stampPickerActionContext = (
  context: ActionContext<unknown, unknown>
) => moduleActionContext(context, stampPicker)

export const actions = defineActions({
  openStampPicker(
    context,
    payload: {
      selectHandler: StampSelectHandler
      position: Place
      positionOf: PositionOf
    }
  ) {
    const { commit } = stampPickerActionContext(context)
    commit.setSelectHandler(payload.selectHandler)
    commit.setPosition(payload.position)
    commit.setPositionOf(payload.positionOf)
  },
  closeStampPicker(context) {
    const { commit } = stampPickerActionContext(context)
    commit.clearSelectHandler()
    commit.clearPosition()
  }
})
