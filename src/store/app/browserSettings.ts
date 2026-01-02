import { reactive, toRefs } from 'vue'

import { computedAsync } from '@vueuse/core'
import { acceptHMRUpdate, defineStore } from 'pinia'

import useIndexedDbValue from '/@/composables/storage/useIndexedDbValue'
import useLocalStorageValue from '/@/composables/storage/useLocalStorage'
import useChannelPath from '/@/composables/useChannelPath'
import { isDefined } from '/@/lib/basic/array'
import { setFallbackForNullishOrOnError } from '/@/lib/basic/fallback'
import { nullUuid } from '/@/lib/basic/uuid'
import { defaultChannelIds, fallbackChannelPath } from '/@/lib/config'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'
import type { ChannelId } from '/@/types/entity-ids'

import { useChannelsStore } from '../entities/channels'

type State = {
  openMode: OpenMode
  lastOpenChannelId: ChannelId | null
  startupChannelId: ChannelId | null
  sendWithModifierKey: SendKey
  modifierKey: SendKeys
  ecoMode: boolean
  prioritizeStarredChannel: boolean
  prioritizeNotifiedChannel: boolean
  activityMode: ActivityMode
  filterStarChannel: boolean
}

export const sendKeys = ['modifier', 'none'] as const
export type SendKey = (typeof sendKeys)[number]

export const isSendKey = (value: string): value is SendKey => {
  return (sendKeys as readonly string[]).includes(value)
}

export interface SendKeys {
  /**
   * Windows: Alt, Mac: ⌥(Option)
   */
  alt: boolean
  /**
   * Windows: Ctrl, Mac: ⌘(Command)
   */
  ctrl: boolean
  /**
   * Windows: Shift, Mac: Shift
   */
  shift: boolean
  /**
   * Windows: なし, Mac: Ctrl
   */
  macCtrl: boolean
}
export type OpenMode = 'lastOpen' | 'particular'
export interface ActivityMode {
  all: boolean
  perChannel: boolean
}

const useBrowserSettingsPinia = defineStore('app/browserSettings', () => {
  const initialValue: State = {
    openMode: 'particular',
    lastOpenChannelId: null,
    startupChannelId: null,
    sendWithModifierKey: 'modifier',
    modifierKey: { alt: true, ctrl: true, shift: false, macCtrl: true },
    ecoMode: false,
    prioritizeStarredChannel: true,
    prioritizeNotifiedChannel: true,
    activityMode: { all: false, perChannel: false },
    filterStarChannel: false
  }

  const { channelsMap, bothChannelsMapInitialFetchPromise } = useChannelsStore()
  const { channelPathStringToId, channelIdToPathString } = useChannelPath()

  const [state, migrationPromise] = useLocalStorageValue(
    'store/app/browserSettings',
    2,
    {
      1: async store => {
        const [dbState, _restoring, restoringPromise] = useIndexedDbValue(
          'store/app/browserSettings',
          1,
          {},
          initialValue
        )
        await restoringPromise
        return { ...store, ...dbState }
      },
      2: async oldStore => {
        // v1 -> v2: path から ID への変換

        await bothChannelsMapInitialFetchPromise

        type OldState = State & {
          openChannelName?: string
          lastOpenChannelName?: string
        }

        const store = oldStore as OldState

        if (isDefined(store.openChannelName)) {
          store.startupChannelId = setFallbackForNullishOrOnError(null).exec(
            () => channelPathStringToId(store.openChannelName ?? '')
          )
          delete store.openChannelName
        }

        if (isDefined(store.lastOpenChannelName)) {
          store.lastOpenChannelId = setFallbackForNullishOrOnError(null).exec(
            () => channelPathStringToId(store.lastOpenChannelName ?? '')
          )
          delete store.lastOpenChannelName
        }

        return store
      }
    },
    initialValue
  )

  const getStartupChannelId = async () => {
    await Promise.all([bothChannelsMapInitialFetchPromise, migrationPromise])

    const id = (() => {
      switch (state.openMode) {
        case 'lastOpen':
          return state.lastOpenChannelId
        case 'particular':
          return state.startupChannelId
        default: {
          const invalid: never = state.openMode
          // eslint-disable-next-line no-console
          console.warn('Invalid app/browserSettings.openMode:', invalid)
          return state.startupChannelId
        }
      }
    })()

    if (id) return id

    return defaultChannelIds.find(id => channelsMap.value.has(id)) ?? nullUuid
  }

  const getStartupChannelPath = async () => {
    const id = await getStartupChannelId()
    return setFallbackForNullishOrOnError(fallbackChannelPath).exec(() =>
      channelIdToPathString(id)
    )
  }

  const startupChannelId = computedAsync(getStartupChannelId, nullUuid)

  const startupChannelPath = computedAsync(
    getStartupChannelPath,
    fallbackChannelPath
  )

  return {
    ...toRefs(state),
    config: reactive(state),
    getStartupChannelId,
    getStartupChannelPath,
    startupChannelId,
    startupChannelPath
  }
})

export const useBrowserSettings = convertToRefsStore(useBrowserSettingsPinia)

if (import.meta.hot) {
  import.meta.hot.accept(
    acceptHMRUpdate(useBrowserSettingsPinia, import.meta.hot)
  )
}
