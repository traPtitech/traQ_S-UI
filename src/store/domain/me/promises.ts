import { waitMount } from '@/onMount'
import store from '@/store'
import { watch } from 'vue'

export const unreadChannelsMapInitialFetchPromise = (async () => {
  await waitMount
  return new Promise<void>(async resolve => {
    const stop = watch(
      () => store.state.domain.me.unreadChannelsMapFetched,
      fetched => {
        if (fetched) {
          resolve()
          stop()
        }
      }
    )
  })
})()
