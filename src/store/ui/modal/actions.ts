import { defineActions } from 'direct-vuex'
import store, { moduleActionContext } from '@/store'
import { ModalState } from './state'
import { modal } from './index'
import { domain } from '@/store/domain'

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
    const { state } = modalActionContext(context)

    // popstateが非同期で呼び出されるので現在のものと一致するのでそれは無視
    const isUsedIndex = state.modalState
      .slice(1)
      .findIndex(ms => deepEquals(ms, modalState))
    if (isUsedIndex !== -1) {
      return
    }

    switch (modalState.type) {
      case 'user':
        store.commit.domain.deleteUserDetail(modalState.id)
        break
      case 'notification':
        break
      case 'setting':
        break
      default:
        const invalid: never = modalState
        throw new Error(`Invalid Modal State type: ${(invalid as any).type}`)
    }
  }
})
