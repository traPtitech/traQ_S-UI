import { Stamp } from '@traptitech/traq'
import { defineStore, acceptHMRUpdate } from 'pinia'
import { computed, ref } from 'vue'
import { useTrueChangedPromise } from '/@/store/utils/promise'
import { isDefined } from '/@/lib/basic/array'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'
import { StampId } from '/@/types/entity-ids'
import { createSingleflight } from '/@/lib/basic/async'
import apis from '/@/lib/apis'
import { entityMitt } from './mitt'
import { CacheStrategy, fetchWithCacheStrategy } from './utils'
import { getUnicodeStamps, setUnicodeStamps } from '/@/lib/stampCache'
import { arrayToMap } from '/@/lib/basic/map'
import { wsListener } from '/@/lib/websocket'

const getStamp = createSingleflight(apis.getStamp.bind(apis))
const getStamps = createSingleflight(apis.getStamps.bind(apis))

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

    const unicodeStamps = await getUnicodeStamps()
    // unicodeスタンプがIndexedDBに存在しないときは含めて取得する
    const [{ data: stamps }, shared] = await getStamps(!unicodeStamps)

    const stampsWithUnicodeStamps = unicodeStamps
      ? [...unicodeStamps, ...stamps]
      : stamps
    const newStampsMap = arrayToMap(stampsWithUnicodeStamps, 'id')
    if (!shared) {
      stampsMap.value = newStampsMap
      stampsMapFetched.value = true
      // 新しくunicodeスタンプが取得されたときはIndexedDBに保存する
      if (!unicodeStamps) {
        setUnicodeStamps(stamps.filter(stamp => stamp.isUnicode))
      }

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
