import type { StampPalette } from '@traptitech/traq'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { CacheStrategy } from './utils'
import { fetchWithCacheStrategy } from './utils'
import apis from '/@/lib/apis'
import { createSingleflight } from '/@/lib/basic/async'
import { arrayToMap } from '/@/lib/basic/map'
import { wsListener } from '/@/lib/websocket'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'
import { useTrueChangedPromise } from '/@/store/utils/promise'
import type { StampPaletteId } from '/@/types/entity-ids'

const getStampPalette = createSingleflight(apis.getStampPalette.bind(apis))
const getStampPalettes = createSingleflight(apis.getStampPalettes.bind(apis))
const deleteStampPaletteSingleflight = createSingleflight(
  apis.deleteStampPalette.bind(apis)
)

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
      getStampPalette,
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

    const [{ data: stampPalettes }, shared] = await getStampPalettes()
    const newStampPalettesMap = arrayToMap(stampPalettes, 'id')
    if (!shared) {
      stampPalettesMap.value = newStampPalettesMap
      stampPalettesMapFetched.value = true
    }
    return newStampPalettesMap
  }

  const deleteStampPalette = async (stampPaletteId: StampPaletteId) => {
    await deleteStampPaletteSingleflight(stampPaletteId)

    if (stampPalettesMap.value.has(stampPaletteId)) {
      stampPalettesMap.value.delete(stampPaletteId)
    }
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
    fetchStampPalettes,
    deleteStampPalette
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
