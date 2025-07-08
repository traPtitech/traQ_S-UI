import type {
  PatchStampPaletteRequest,
  PostStampPaletteRequest,
  StampPalette
} from '@traptitech/traq'
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
const createStampPaletteSingleflight = createSingleflight(
  apis.createStampPalette.bind(apis)
)
const editStampPaletteSingleflight = createSingleflight(
  apis.editStampPalette.bind(apis)
)
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
      apiStampPalette => {
        // レスポンスのStampPaletteはstampsが空配列の場合にnullになるバグがあるので、空配列をセットする
        const normalizedPalette = {
          ...apiStampPalette,
          stamps: apiStampPalette.stamps ?? []
        }
        stampPalettesMap.value.set(stampPaletteId, normalizedPalette)
      }
    )
    if (stampPalette) {
      return {
        ...stampPalette,
        stamps: stampPalette.stamps ?? []
      }
    }
    return stampPalette
  }

  const fetchStampPalettes = async ({
    ignoreCache = false
  }: { ignoreCache?: boolean } = {}) => {
    if (!ignoreCache && stampPalettesMapFetched.value) {
      return stampPalettesMap.value
    }

    const [{ data: stampPalettesFromApi }, shared] = await getStampPalettes()
    // レスポンスのStampPaletteはstampsが空配列の場合にnullになるバグがあるので、空配列をセットする
    const normalizedStampPalettes = stampPalettesFromApi.map(palette => ({
      ...palette,
      stamps: palette.stamps ?? []
    }))
    const newStampPalettesMap = arrayToMap(normalizedStampPalettes, 'id')
    if (!shared) {
      stampPalettesMap.value = newStampPalettesMap
      stampPalettesMapFetched.value = true
    }
    return newStampPalettesMap
  }

  const createStampPalette = async (
    postStampPaletteRequest: PostStampPaletteRequest
  ): Promise<StampPalette> => {
    // FIXME: stampがSetだと400になるので、Arrayに変換
    // issue: https://github.com/traPtitech/traQ_S-UI/issues/4612
    const apiRequestPayload = {
      name: postStampPaletteRequest.name,
      description: postStampPaletteRequest.description,
      stamps: Array.from(postStampPaletteRequest.stamps)
    }
    const [{ data: createdStampPaletteFromApi }, shared] =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await createStampPaletteSingleflight(apiRequestPayload as any)

    // レスポンスのStampPaletteはstampsが空配列の場合にnullになるバグがあるので、空配列をセットする
    const normalizedPalette = {
      ...createdStampPaletteFromApi,
      stamps: createdStampPaletteFromApi.stamps ?? []
    }
    if (!shared) {
      stampPalettesMap.value.set(normalizedPalette.id, normalizedPalette)
    }
    return normalizedPalette
  }

  const editStampPalette = async (
    stampPaletteId: StampPaletteId,
    patchStampPaletteRequest: PatchStampPaletteRequest
  ) => {
    // FIXME: stampがSetだと400になるので、Arrayに変換
    // issue: https://github.com/traPtitech/traQ_S-UI/issues/4612
    const apiRequestPayload = {
      name: patchStampPaletteRequest.name,
      description: patchStampPaletteRequest.description,
      stamps: patchStampPaletteRequest.stamps
        ? Array.from(patchStampPaletteRequest.stamps)
        : undefined
    }
    const [_, shared] = await editStampPaletteSingleflight(
      stampPaletteId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      apiRequestPayload as any
    )
    if (shared) return
    const paletteToUpdate = stampPalettesMap.value.get(stampPaletteId)
    if (paletteToUpdate) {
      if (apiRequestPayload.name) {
        paletteToUpdate.name = apiRequestPayload.name
      }
      if (apiRequestPayload.description) {
        paletteToUpdate.description = apiRequestPayload.description
      }
      if (apiRequestPayload.stamps) {
        paletteToUpdate.stamps = apiRequestPayload.stamps ?? []
      }
      paletteToUpdate.updatedAt = new Date().toISOString()
      stampPalettesMap.value.set(stampPaletteId, paletteToUpdate)
      fetchStampPalette({ stampPaletteId, cacheStrategy: 'forceFetch' })
    }
  }

  const deleteStampPalette = async (stampPaletteId: StampPaletteId) => {
    const [_, shared] = await deleteStampPaletteSingleflight(stampPaletteId)
    if (!shared && stampPalettesMap.value.has(stampPaletteId)) {
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
    fetchStampPalette,
    fetchStampPalettes,
    createStampPalette,
    editStampPalette,
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
