import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/store'
import { ModalState } from './state'
import { modal } from './index'

export const modalActionContext = (context: any) =>
  moduleActionContext(context, modal)

export const actions = defineActions({
  pushModal: (context, modalState: ModalState) => {
    const { commit, state } = modalActionContext(context)
    history.pushState(
      {
        modalState: [...state.modalState, modalState]
      },
      ''
    )
    commit.setState(history.state.modalState)
  },
  popModal: () => {
    history.back()
  },
  clearModal: context => {
    const { state, dispatch } = modalActionContext(context)
    const length = state.modalState.length
    for (let i = 0; i < length; i++) {
      dispatch.popModal()
    }
  }
})
