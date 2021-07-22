import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '/@/store'
import { ModalState } from './state'
import { modal } from '.'
import router, { constructChannelPath, constructUserPath } from '/@/router'
import useCurrentChannelPath from '/@/use/currentChannelPath'
import { ActionContext } from 'vuex'
import { toRaw } from 'vue'
import { wait } from '/@/lib/util/timer'

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
        ...history.state,
        // historyのstateにはproxyされたobjectは入らないのでtoRawする
        modalState: [...toRaw(state.modalState), modalState]
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
        ...history.state,
        // historyのstateにはproxyされたobjectは入らないのでtoRawする
        modalState: [...toRaw(state.modalState), modalState]
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
  popModal: async () => {
    history.back()

    // stateの同期待ち
    await new Promise(resolve => {
      window.addEventListener('popstate', resolve, { once: true })
    })
    // どのハンドラーが最後に発火するか保証されていないので一応待つ
    await wait(0)
  },

  /**
   * モーダルを閉じ、現在開いているチャンネルにURLを変更する
   *
   * `history.state`が残り一個の状態で、これ以上戻るとtraQの外に出る時用のメソッド (例: `/files/:id`を直に開いた場合)
   * 注意: このメソッドをhistoryにstateが乗っている状態で呼ぶとhistoryとの同期を破壊するため、直接開いたファイル画面を閉じる等以外で呼ばない
   */
  closeModal: context => {
    const { commit, state, getters, rootState } = modalActionContext(context)
    history.replaceState(
      {
        ...history.state,
        // historyのstateにはproxyされたobjectは入らないのでtoRawする
        modalState: [
          ...toRaw(state.modalState).slice(0, state.modalState.length - 2)
        ]
      },
      ''
    )
    commit.setState(history.state.modalState)
    const { currentChannelPathString } = useCurrentChannelPath()
    const primaryViewType = rootState.ui.mainView.primaryView.type
    if (primaryViewType === 'dm') {
      router.replace(constructUserPath(currentChannelPathString.value))
    } else if (primaryViewType === 'channel') {
      router.replace(constructChannelPath(currentChannelPathString.value))
    } else {
      // eslint-disable-next-line no-console
      console.warn(`Unexpected closeModal: ${primaryViewType}`)
    }
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
  }
})
