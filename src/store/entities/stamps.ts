import type { Stamp } from '@traptitech/traq'
import { defineStore, acceptHMRUpdate } from 'pinia'
import { computed, ref } from 'vue'
import { useTrueChangedPromise } from '/@/store/utils/promise'
import { isDefined } from '/@/lib/basic/array'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'
import type { StampId } from '/@/types/entity-ids'
import { createSingleflight } from '/@/lib/basic/async'
import apis from '/@/lib/apis'
import { entityMitt } from './mitt'
import type { CacheStrategy } from './utils'
import { fetchWithCacheStrategy } from './utils'
import { arrayToMap } from '/@/lib/basic/map'
import { wsListener } from '/@/lib/websocket'

const getStamp = createSingleflight(apis.getStamp.bind(apis))
const getStamps = createSingleflight(async () => {
  const [{ data: unicodeStamps }, { data: originalStamps }] = await Promise.all(
    [
      apis.getStamps(undefined, 'unicode'),
      apis.getStamps(undefined, 'original')
    ]
  )
  return [...unicodeStamps, ...originalStamps]
})

const initialRecentStampNames = ['ok_hand', 'thumbsup', 'eyes'] as const

const useStampsStorePinia = defineStore('entities/stamps', () => {
  const stampsMap = ref(new Map<StampId, Stamp>())
  const stampsMapFetched = ref(false)
  const stampsMapInitialFetchPromise = ref(
    useTrueChangedPromise(stampsMapFetched)
  )

  const stampNameTable = computed(
    () =>
      new Map([...stampsMap.value.values()].map(stamp => [stamp.name, stamp]))
  )
  const initialRecentStamps = computed(() =>
    initialRecentStampNames
      .map(name => stampNameTable.value.get(name))
      .filter(isDefined)
  )

  const getStampByName = (name: string) => stampNameTable.value.get(name)
  const deleteStamp = (stampId: StampId) => {
    stampsMap.value.delete(stampId)
    entityMitt.emit('deleteStamp', stampId)
  }

  /**
   * unicodeスタンプが更新されたときの考慮は存在しない
   */
  const fetchStamp = async ({
    stampId,
    cacheStrategy = 'waitForAllFetch'
  }: {
    stampId: StampId
    cacheStrategy?: CacheStrategy
  }) => {
    const stamp = await fetchWithCacheStrategy(
      cacheStrategy,
      stampsMap,
      stampId,
      stampsMapFetched.value,
      stampsMapInitialFetchPromise.value,
      getStamp,
      stamp => {
        stampsMap.value.set(stamp.id, stamp)
        entityMitt.emit('setStamp', stamp)
      }
    )
    return stamp
  }

  /**
   * unicodeスタンプが更新されたときは手動で設定からキャッシュの削除をする必要がある
   */
  const fetchStamps = async ({
    ignoreCache = false
  }: { ignoreCache?: boolean } = {}) => {
    if (!ignoreCache && stampsMapFetched.value) {
      return stampsMap.value
    }

    const [stamps, shared] = await getStamps()
    const newStampsMap = arrayToMap(stamps, 'id')
    if (!shared) {
      stampsMap.value = newStampsMap
      stampsMapFetched.value = true
      entityMitt.emit('setStamps')
    }
    return stampsMap
  }

  wsListener.on('STAMP_CREATED', ({ id }) => {
    fetchStamp({ stampId: id })
  })
  wsListener.on('STAMP_UPDATED', ({ id }) => {
    fetchStamp({ stampId: id, cacheStrategy: 'forceFetch' })
  })
  wsListener.on('STAMP_DELETED', ({ id }) => {
    deleteStamp(id)
  })
  wsListener.on('reconnect', () => {
    fetchStamps({ ignoreCache: true })
  })

  return {
    stampsMap,
    stampsMapFetched,
    stampsMapInitialFetchPromise,
    initialRecentStamps,
    getStampByName,
    fetchStamps
  }
})

export const useStampsStore = convertToRefsStore(useStampsStorePinia)

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useStampsStorePinia, import.meta.hot))
}
