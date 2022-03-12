import { defineStore, acceptHMRUpdate } from 'pinia'
import { computed, toRefs } from 'vue'
import { replacePrefix } from '/@/lib/basic/string'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'
import useIndexedDbValue from '/@/use/indexedDbValue'
import { channelTreeMitt } from '/@/store/domain/channelTree'
import { getVuexData } from '/@/store/utils/migrateFromVuex'
import { isObjectAndHasKey } from '/@/lib/basic/object'
import { promisifyRequest } from 'idb-keyval'

type State = {
  openMode: OpenMode
  lastOpenChannelName: string
  openChannelName: string
  sendWithModifierKey: SendKey
  modifierKey: SendKeys
  ecoMode: boolean
  activityMode: ActivityMode
  filterStarChannel: boolean
}

export type SendKey = 'modifier' | 'none'
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
    lastOpenChannelName: 'general',
    openChannelName: 'general',
    sendWithModifierKey: 'modifier',
    modifierKey: { alt: true, ctrl: true, shift: true, macCtrl: true },
    ecoMode: false,
    activityMode: { all: false, perChannel: false },
    filterStarChannel: false
  }

  const [state, restoring, restoringPromise] = useIndexedDbValue(
    'store/app/browserSettings',
    1,
    {
      // migrate from vuex
      1: async getStore => {
        const vuexStore = await getVuexData()
        if (!vuexStore) return
        if (!isObjectAndHasKey(vuexStore, 'app')) return
        if (!isObjectAndHasKey(vuexStore.app, 'browserSettings')) return
        const addReq = getStore().add(vuexStore.app.browserSettings, 'key')
        await promisifyRequest(addReq)
      }
    },
    initialValue
  )

  const defaultChannelName = computed(() => {
    switch (state.openMode) {
      case 'lastOpen':
        return state.lastOpenChannelName
      case 'particular':
        return state.openChannelName
      default: {
        const invalid: never = state.openMode
        // eslint-disable-next-line no-console
        console.warn('Invalid app/browserSettings.openMode:', invalid)
        return state.openChannelName
      }
    }
  })

  const updateOpenChannelNames = async ({
    oldName,
    newName
  }: {
    oldName: string
    newName: string
  }) => {
    await restoringPromise.value

    state.openChannelName = replacePrefix(
      state.openChannelName,
      oldName,
      newName
    )
    state.lastOpenChannelName = replacePrefix(
      state.lastOpenChannelName,
      oldName,
      newName
    )
  }

  channelTreeMitt.on('moved', ({ oldPath, newPath }) => {
    updateOpenChannelNames({
      oldName: oldPath,
      newName: newPath
    })
  })

  return {
    ...toRefs(state),
    restoring,
    restoringPromise,
    defaultChannelName
  }
})

export const useBrowserSettings = convertToRefsStore(useBrowserSettingsPinia)

if (import.meta.hot) {
  import.meta.hot.accept(
    acceptHMRUpdate(useBrowserSettingsPinia, import.meta.hot)
  )
}
