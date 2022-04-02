import type { ClipFolder } from '@traptitech/traq'
import { defineStore, acceptHMRUpdate } from 'pinia'
import { ref } from 'vue'
import { useTrueChangedPromise } from '/@/store/utils/promise'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'
import type { ClipFolderId } from '/@/types/entity-ids'
import { createSingleflight } from '/@/lib/basic/async'
import apis from '/@/lib/apis'
import type { CacheStrategy } from './utils'
import { fetchWithCacheStrategy } from './utils'
import { arrayToMap } from '/@/lib/basic/map'
import { wsListener } from '/@/lib/websocket'

const getClipFolder = createSingleflight(apis.getClipFolder.bind(apis))
const getClipFolders = createSingleflight(apis.getClipFolders.bind(apis))

const useClipFoldersStorePinia = defineStore('entities/clipFolders', () => {
  const clipFoldersMap = ref(new Map<ClipFolderId, ClipFolder>())
  const clipFoldersMapFetched = ref(false)
  const clipFoldersMapInitialFetchPromise = ref(
    useTrueChangedPromise(clipFoldersMapFetched)
  )

  const fetchClipFolder = async ({
    clipFolderId,
    cacheStrategy = 'waitForAllFetch'
  }: {
    clipFolderId: ClipFolderId
    cacheStrategy?: CacheStrategy
  }) => {
    const clipFolder = await fetchWithCacheStrategy(
      cacheStrategy,
      clipFoldersMap,
      clipFolderId,
      clipFoldersMapFetched.value,
      clipFoldersMapInitialFetchPromise.value,
      getClipFolder,
      clipFolder => {
        clipFoldersMap.value.set(clipFolder.id, clipFolder)
      }
    )
    return clipFolder
  }

  const fetchClipFolders = async ({
    ignoreCache = false
  }: { ignoreCache?: boolean } = {}) => {
    if (!ignoreCache && clipFoldersMapFetched.value) {
      return clipFoldersMap.value
    }

    const [{ data: clipFolders }, shared] = await getClipFolders()
    const newClipFoldersMap = arrayToMap(clipFolders, 'id')
    if (!shared) {
      clipFoldersMap.value = newClipFoldersMap
      clipFoldersMapFetched.value = true
    }
    return newClipFoldersMap
  }

  wsListener.on('CLIP_FOLDER_CREATED', ({ id }) => {
    fetchClipFolder({ clipFolderId: id })
  })
  wsListener.on('CLIP_FOLDER_UPDATED', ({ id }) => {
    fetchClipFolder({
      clipFolderId: id,
      cacheStrategy: 'forceFetch'
    })
  })
  wsListener.on('CLIP_FOLDER_DELETED', ({ id }) => {
    clipFoldersMap.value.delete(id)
  })
  wsListener.on('reconnect', () => {
    fetchClipFolders({ ignoreCache: true })
  })

  return {
    clipFoldersMap,
    fetchClipFolder,
    fetchClipFolders
  }
})

export const useClipFoldersStore = convertToRefsStore(useClipFoldersStorePinia)

if (import.meta.hot) {
  import.meta.hot.accept(
    acceptHMRUpdate(useClipFoldersStorePinia, import.meta.hot)
  )
}
