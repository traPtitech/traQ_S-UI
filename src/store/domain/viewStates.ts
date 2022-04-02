import type { MyChannelViewState } from '@traptitech/traq'
import { ChannelViewState } from '@traptitech/traq'
import { defineStore, acceptHMRUpdate } from 'pinia'
import { computed, ref } from 'vue'
import { useTrueChangedPromise } from '/@/store/utils/promise'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'
import apis from '/@/lib/apis'
import { wsListener } from '/@/lib/websocket'

const useViewStatesStorePinia = defineStore('domain/viewStates', () => {
  const viewStates = ref(new Map<string, MyChannelViewState>())
  const viewStatesFetched = ref(false)
  const viewStatesInitialFetchPromise = ref(
    useTrueChangedPromise(viewStatesFetched)
  )
  const monitoringChannels = computed(
    () =>
      new Set(
        [...viewStates.value.values()]
          .filter(
            vs =>
              vs.state === ChannelViewState.Monitoring ||
              vs.state === ChannelViewState.Editing
          )
          .map(vs => vs.channelId)
      )
  )
  const fetchViewStates = async ({
    ignoreCache = false
  }: { ignoreCache?: boolean } = {}) => {
    if (!ignoreCache && viewStatesFetched.value) return

    const res = await apis.getMyViewStates()
    viewStates.value = new Map(res.data.map(v => [v.key, v]))
    viewStatesFetched.value = true
  }

  wsListener.on('USER_VIEWSTATE_CHANGED', ({ view_states: newViewStates }) => {
    viewStates.value = new Map(newViewStates.map(v => [v.key, v]))
  })
  wsListener.on('reconnect', () => {
    fetchViewStates({ ignoreCache: true })
  })

  return {
    viewStatesInitialFetchPromise,
    monitoringChannels,
    fetchViewStates
  }
})

export const useViewStatesStore = convertToRefsStore(useViewStatesStorePinia)

if (import.meta.hot) {
  import.meta.hot.accept(
    acceptHMRUpdate(useViewStatesStorePinia, import.meta.hot)
  )
}
