import { defineStore, acceptHMRUpdate } from 'pinia'
import { computed, toRefs } from 'vue'
import { replacePrefix } from '/@/lib/basic/string'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'
import useIndexedDbValue from '/@/composables/utils/useIndexedDbValue'
import { channelTreeMitt } from '/@/store/domain/channelTree'
import { getVuexData } from '/@/store/utils/migrateFromVuex'
import { isObjectAndHasKey } from '/@/lib/basic/object'
import { promisifyRequest } from 'idb-keyval'
import type { Union } from 'ts-pattern/dist/types/helpers'

type FeatureFlagKey = 'test1' | 'test2'

type State = {
  status: Map<FeatureFlagKey, boolean | undefined>
  enabled: true
}

type FeatureFlagDescription = {
  title: string
  description: string
  defaultValue: boolean
  endAt: Date // 最大一ヶ月先を指定し、それ以上先は指定しない
}

export type FeatureFlag = FeatureFlagDescription & { enabled: boolean }

export const featureFlagDescriptions: Record<
  FeatureFlagKey,
  FeatureFlagDescription
> = {
  test1: {
    title: 'フラグテスト 1',
    description: 'test1',
    defaultValue: true,
    endAt: new Date('2024-07-31')
  },
  test2: {
    title: 'フラグテスト 2',
    description: 'test2',
    defaultValue: false,
    endAt: new Date('2020-01-31')
  }
}

const useFlagSettingsPinia = defineStore('app/featureFlagSettings', () => {
  const initialValue: State = {
    status: new Map<FeatureFlagKey, boolean | undefined>(),
    enabled: true,
  }

  const [state, restoring, restoringPromise] = useIndexedDbValue(
    'store/app/featureFlagSettings',
    1,
    {
      // migrate from vuex
      1: async getStore => {
        const vuexStore = await getVuexData()
        if (!vuexStore) return
        if (!isObjectAndHasKey(vuexStore, 'app')) return
        if (!isObjectAndHasKey(vuexStore.app, 'featureFlagSettings')) return
        const addReq = getStore().add(vuexStore.app.featureFlagSettings, 'key')
        await promisifyRequest(addReq)
      }
    },
    initialValue
  )

  const isFlagEnabled = (flag: FeatureFlagKey): boolean => {
    const featureFlag = featureFlagDescriptions[flag]
    if (featureFlag.endAt < new Date()) {
      return false
    }
    return state.status.get(flag) ?? featureFlag.defaultValue
  }

  const FeatureFlags = computed(() => {
    const res: Map<FeatureFlagKey, FeatureFlag> = new Map()
    Object.entries(featureFlagDescriptions).forEach(([flag, featureFlag]) => {
      res.set(flag as FeatureFlagKey, {
        title: featureFlag.title,
        description: featureFlag.description,
        defaultValue: featureFlag.defaultValue,
        endAt: featureFlag.endAt,
        enabled: isFlagEnabled(flag as FeatureFlagKey)
      })
    })
    return res
  })

  const updateFeatureFlagStatus = async (
    flag: FeatureFlagKey,
    enabled: boolean
  ) => {
    await restoringPromise.value
    state.status.set(flag, enabled)
  }

  return {
    updateFeatureFlagStatus,
    FeatureFlags,
    restoring
  }
})

export const useFeatureFlagSettings = convertToRefsStore(useFlagSettingsPinia)

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useFlagSettingsPinia, import.meta.hot))
}
