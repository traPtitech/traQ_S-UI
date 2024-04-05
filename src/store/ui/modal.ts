import { defineStore, acceptHMRUpdate } from 'pinia'
import { computed, ref, toRaw } from 'vue'
import { wait } from '/@/lib/basic/timer'
import router, { constructChannelPath, constructUserPath } from '/@/router'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'
import type { ModalState } from '/@/store/ui/modal/states'
import { useChannelsStore } from '/@/store/entities/channels'
import { useMainViewStore } from '/@/store/ui/mainView'
import useChannelPath from '/@/composables/useChannelPath'

const useModalStorePinia = defineStore('ui/modal', () => {
  const mainViewStore = useMainViewStore()
  const channelsStore = useChannelsStore()

  const modalState = ref<ModalState[]>([])
  const currentState = computed(
    () => modalState.value[modalState.value.length - 1]
  )
  window.addEventListener('popstate', event => {
    // history.stateとstoreの同期をとる
    if (event.state?.modalState) {
      modalState.value = event.state.modalState
    } else {
      modalState.value = []
    }
  })

  /** ロード時からモーダルを表示していて、そこからモーダルを閉じたことがないか */
  const isOnInitialModalRoute = ref(false)

  /** モーダルを非表示にしようとしている最中か */
  const isClearingModal = ref(false)

  const shouldShowModal = computed(
    () => modalState.value.length > 0 && !isClearingModal.value
  )

  const clearModalState = () => {
    modalState.value = []
    history.replaceState({ ...history.state, modalState: [] }, '')
  }

  /**
   * モーダルを開き、`history.state`に状態を追加する
   */
  const pushModal = (newModalState: ModalState) => {
    history.pushState(
      {
        ...history.state,
        // historyのstateにはproxyされたobjectは入らないのでtoRawする
        modalState: [...toRaw(modalState.value), newModalState]
      },
      ''
    )
    modalState.value = history.state.modalState
  }

  /**
   * モーダルを開き、現在の`history.state`を置き換える
   */
  const replaceModal = (newModalState: ModalState) => {
    history.replaceState(
      {
        ...history.state,
        // historyのstateにはproxyされたobjectは入らないのでtoRawする
        modalState: [...toRaw(modalState.value), newModalState]
      },
      ''
    )
    modalState.value = history.state.modalState
  }

  /**
   * モーダルを閉じ、場合によって適切な処理をする
   */
  const popOrCloseModal = async () => {
    if (isOnInitialModalRoute.value && modalState.value.length === 1) {
      closeModal()
    } else {
      await popModal()
    }
  }

  /**
   * モーダルを閉じ、履歴をひとつ戻る
   */
  const popModal = async () => {
    history.back()

    // stateの同期待ち
    await new Promise(resolve => {
      window.addEventListener('popstate', resolve, { once: true })
    })
    // どのハンドラーが最後に発火するか保証されていないので一応待つ
    await wait(0)
  }

  /**
   * モーダルを閉じ、現在開いているチャンネルにURLを変更する
   *
   * `history.state`が残り一個の状態で、これ以上戻るとtraQの外に出る時用のメソッド (例: `/files/:id`を直に開いた場合)
   * 注意: このメソッドをhistoryにstateが乗っている状態で呼ぶとhistoryとの同期を破壊するため、直接開いたファイル画面を閉じる等以外で呼ばない
   */
  const closeModal = () => {
    history.replaceState(
      {
        ...history.state,
        // historyのstateにはproxyされたobjectは入らないのでtoRawする
        modalState: [
          ...toRaw(modalState.value).slice(0, modalState.value.length - 2)
        ]
      },
      ''
    )
    modalState.value = history.state.modalState

    const { channelIdToPathString } = useChannelPath()
    const primaryView = mainViewStore.primaryView.value
    if (primaryView.type === 'channel') {
      router.replace(
        constructChannelPath(channelIdToPathString(primaryView.channelId))
      )
    } else if (primaryView.type === 'dm') {
      router.replace(constructUserPath(primaryView.userName))
    } else {
      // eslint-disable-next-line no-console
      console.warn('Unexpected closeModal')
    }
  }

  /**
   * 全てのモーダルを閉じる
   */
  const clearModal = async () => {
    const length = modalState.value.length
    isClearingModal.value = true
    try {
      for (let i = 0; i < length; i++) {
        if (isOnInitialModalRoute.value && i === length - 1) {
          closeModal()
          continue
        }

        await popModal()
      }
    } finally {
      isClearingModal.value = false
    }
  }

  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && shouldShowModal.value) {
      popModal()
    }
  })

  return {
    isOnInitialModalRoute,
    isClearingModal,
    shouldShowModal,
    currentState,

    clearModalState,
    pushModal,
    replaceModal,
    popOrCloseModal,
    popModal,
    closeModal,
    clearModal
  }
})

export const useModalStore = convertToRefsStore(useModalStorePinia)

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useModalStorePinia, import.meta.hot))
}
