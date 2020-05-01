import { defineActions } from 'direct-vuex'
import store, { moduleActionContext } from '@/store'
import { isEqual } from 'lodash-es'
import { ModalState } from './state'
import { modal } from './index'
import router, { constructChannelPath, constructUserPath } from '@/router'
import useCurrentChannelPath from '@/use/currentChannelPath'
import { ActionContext } from 'vuex'

export const modalActionContext = (context: ActionContext<unknown, unknown>) =>
  moduleActionContext(context, modal)

export const actions = defineActions({
  /**
   * モーダルを開き、`history.state`に状態を追加する
   */
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
  /**
   * モーダルを開き、現在の`history.state`を置き換える
   */
  replaceModal: (context, modalState: ModalState) => {
    const { commit, state } = modalActionContext(context)
    history.replaceState(
      {
        modalState: [...state.modalState, modalState]
      },
      ''
    )
    commit.setState(history.state.modalState)
  },
  /**
   * モーダルを閉じ、場合によって適切な処理をする
   */
  popOrCloseModal: async context => {
    const { state, dispatch } = modalActionContext(context)
    if (state.isOnInitialModalRoute && state.modalState.length === 1) {
      await dispatch.closeModal()
    } else {
      await dispatch.popModal()
    }
  },

  /**
   * モーダルを閉じ、履歴をひとつ戻る
   */
  popModal: async context => {
    const { getters, dispatch } = modalActionContext(context)
    const { currentState } = getters
    history.back()

    // stateの同期待ち
    await new Promise(resolve => {
      window.addEventListener('popstate', resolve, { once: true })
    })
    // どのハンドラーが最後に発火するか保証されていないので一応待つ
    await new Promise(resolve => {
      setTimeout(resolve, 0)
    })

    await dispatch.collectGarbage(currentState)
  },

  /**
   * モーダルを閉じ、現在開いているチャンネルにURLを変更する
   *
   * `history.state`が残り一個の状態で、これ以上戻るとtraQの外に出る時用のメソッド (例: `/files/:id`を直に開いた場合)
   * 注意: このメソッドをhistoryにstateが乗っている状態で呼ぶとhistoryとの同期を破壊するため、直接開いたファイル画面を閉じる等以外で呼ばない
   */
  closeModal: context => {
    const { commit, state, dispatch, getters } = modalActionContext(context)
    const { currentState } = getters
    history.replaceState(
      {
        modalState: [...state.modalState.slice(0, state.modalState.length - 2)]
      },
      ''
    )
    commit.setState(history.state.modalState)
    const { currentChannelPathString } = useCurrentChannelPath()
    const primaryViewType = store.state.ui.mainView.primaryView.type
    if (primaryViewType === 'dm') {
      router.replace(constructUserPath(currentChannelPathString.value))
    } else if (primaryViewType === 'channel') {
      router.replace(constructChannelPath(currentChannelPathString.value))
    } else {
      // eslint-disable-next-line no-console
      console.warn(`Unexpected closeModal: ${primaryViewType}`)
    }
    dispatch.collectGarbage(currentState)
  },
  /**
   * 全てのモーダルを閉じる
   */
  clearModal: async context => {
    const { state, commit, dispatch } = modalActionContext(context)
    const length = state.modalState.length
    commit.setIsClearingModal(true)
    try {
      for (let i = 0; i < length; i++) {
        if (state.isOnInitialModalRoute && i === length - 1) {
          await dispatch.closeModal()
          continue
        }

        await dispatch.popModal()
      }
    } finally {
      commit.setIsClearingModal(false)
    }
  },
  collectGarbage(context, modalState: ModalState) {
    const { state } = modalActionContext(context)

    const isUsed = state.modalState.some(ms => isEqual(ms, modalState))
    if (isUsed) {
      return
    }

    switch (modalState.type) {
      case 'user':
        store.commit.domain.deleteUserDetail(modalState.id)
        break
      case 'tag':
        store.commit.entities.deleteTag(modalState.id)
        break
      case 'notification':
      case 'file':
      case 'setting':
      case 'group':
      case 'channel-create':
      case 'qrcode':
      case 'clip-create':
      case 'clip-folder-create':
        break
      default: {
        const invalid: never = modalState
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        throw new Error(`Invalid Modal State type: ${(invalid as any).type}`)
      }
    }
  }
})
