import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/store'
import { ModalState } from './state'
import { modal } from './index'
import { UserId } from '@/types/entity-ids'
import apis from '@/lib/api'

const deepEquals = (a: Object, b: Object) =>
  JSON.stringify(a) === JSON.stringify(b)

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
  popModal: context => {
    const { getters, dispatch } = modalActionContext(context)
    const { currentState } = getters
    history.back()
    dispatch.collectGarbage(currentState)
  },
  clearModal: context => {
    const { state, dispatch } = modalActionContext(context)
    const length = state.modalState.length
    for (let i = 0; i < length; i++) {
      dispatch.popModal()
    }
  },
  collectGarbage(context, modalState: ModalState) {
    const { state, commit } = modalActionContext(context)
    if (state.modalState.findIndex(ms => deepEquals(ms, modalState)) !== -1) {
      return
    }

    switch (modalState.type) {
      case 'user':
        commit.deleteUserDetail(modalState.id)
        break
      default:
        const invalid: never = modalState.type
        throw new Error(`Invalid Modal State type: ${invalid}`)
    }
  },
  async fetchUserDetail(context, userId: UserId) {
    const { commit } = modalActionContext(context)
    const res = await apis.getUser(userId)
    commit.setUserDetail(res.data)
  }
})
