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

type FeatureFlagKey = 'flag_test'

type State = {
  status: Map<FeatureFlagKey, boolean | undefined>
}

type FeatureFlagDescription = {
  title: string
  description: string
  defaultValue: boolean
  endAt: Date // 最大一ヶ月先を指定し、それ以上先は指定しない
}

export type FeatureFlag = FeatureFlagDescription & { enabled: boolean }

/*
  *** FeatureFlag の利用仮ルール ***
  - 日時の指定は最大一ヶ月先まで （FeatureFlag の利用を前提とした・FeatureFlag を乱用した運用を避けるため。期間後に本実装するかを検討する）
  - 利用しなくなった FeatureFlag は削除する
  - 仮ルールなので必要に応じて変えてほしいです
*/

export const featureFlagDescriptions: Record<
  FeatureFlagKey,
  FeatureFlagDescription
> = {
  flag_test: {
    title: 'フラグテスト・サンプル用',
    description: '「提供終了日」の表記がひらがなになります。',
    defaultValue: true,
    endAt: new Date('2024-08-31')
  },
}

const useFlagSettingsPinia = defineStore('app/featureFlagSettings', () => {
  const initialValue: State = {
    status: new Map<FeatureFlagKey, boolean | undefined>()
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

  const FlagStatus = computed(() => {
    const res: Record<FeatureFlagKey, boolean> = {} as Record<FeatureFlagKey, boolean>
    Object.entries(featureFlagDescriptions).forEach(([flag, featureFlag]) => {
      res[flag as FeatureFlagKey] = isFlagEnabled(flag as FeatureFlagKey)
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
    FlagStatus,
    restoring
  }
})

export const useFeatureFlagSettings = convertToRefsStore(useFlagSettingsPinia)

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useFlagSettingsPinia, import.meta.hot))
}
