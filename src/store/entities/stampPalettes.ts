import type { StampPalette } from '@traptitech/traq'
import { defineStore, acceptHMRUpdate } from 'pinia'
import { computed, ref } from 'vue'
import { useTrueChangedPromise } from '/@/store/utils/promise'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'
import type { StampPaletteId } from '/@/types/entity-ids'
import { createSingleflight } from '/@/lib/basic/async'
import apis from '/@/lib/apis'
import { wsListener } from '/@/lib/websocket'
import type { CacheStrategy } from './utils'
import { fetchWithCacheStrategy } from './utils'
import { arrayToMap } from '/@/lib/basic/map'

const getStampPlalette = createSingleflight(apis.getStampPalette.bind(apis))
const getStampPlalettes = createSingleflight(apis.getStampPalettes.bind(apis))

const useStampPalettesStorePinia = defineStore('entities/stampPalettes', () => {
  const stampPalettesMap = ref(new Map<StampPaletteId, StampPalette>())
  const stampPalettesMapFetched = ref(false)
  const stampPalettesMapInitialFetchPromise = ref(
    useTrueChangedPromise(stampPalettesMapFetched)
  )

  const nonEmptyStampPaletteIds = computed(() =>
    [...stampPalettesMap.value.values()]
      .filter(palette => palette.stamps?.length > 0)
      .map(palette => palette.id)
  )

  const fetchStampPalette = async ({
    stampPaletteId,
    cacheStrategy = 'waitForAllFetch'
  }: {
    stampPaletteId: StampPaletteId
    cacheStrategy?: CacheStrategy
  }) => {
    const stampPalette = await fetchWithCacheStrategy(
      cacheStrategy,
      stampPalettesMap,
      stampPaletteId,
      stampPalettesMapFetched.value,
      stampPalettesMapInitialFetchPromise.value,
      getStampPlalette,
      stampPalette => {
        stampPalettesMap.value.set(stampPalette.id, stampPalette)
      }
    )
    return stampPalette
  }

  const fetchStampPalettes = async ({
    ignoreCache = false
  }: { ignoreCache?: boolean } = {}) => {
    if (!ignoreCache && stampPalettesMapFetched.value) {
      return stampPalettesMap
    }

    const [{ data: stampPalettes }, shared] = await getStampPlalettes()
    const newStampPalettesMap = arrayToMap(stampPalettes, 'id')
    if (!shared) {
      stampPalettesMap.value = newStampPalettesMap
      stampPalettesMapFetched.value = true
    }
    return newStampPalettesMap
  }

  wsListener.on('STAMP_PALETTE_CREATED', ({ id }) => {
    // eslint-disable-next-line no-console
    console.error('onStampPaletteCreated: Not implemented')
  })
  wsListener.on('STAMP_PALETTE_UPDATED', ({ id }) => {
    // eslint-disable-next-line no-console
    console.error('onStampPaletteUpdated: Not implemented')
  })
  wsListener.on('STAMP_PALETTE_DELETED', ({ id }) => {
    // eslint-disable-next-line no-console
    console.error('onStampPaletteDeleted: Not implemented')
  })
  wsListener.on('reconnect', () => {
    fetchStampPalettes({ ignoreCache: true })
  })

  return {
    stampPalettesMap,
    nonEmptyStampPaletteIds,
    fetchStampPalettes
  }
})

export const useStampPalettesStore = convertToRefsStore(
  useStampPalettesStorePinia
)

if (import.meta.hot) {
  import.meta.hot.accept(
    acceptHMRUpdate(useStampPalettesStorePinia, import.meta.hot)
  )
}
