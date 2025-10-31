import { defineStore, acceptHMRUpdate } from 'pinia'
import { computed } from 'vue'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'
import useIndexedDbValue from '/@/composables/utils/useIndexedDbValue'
import { isWebKit } from '/@/lib/dom/browser'

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

export const featureFlagDescriptions = {
  flag_test: {
    title: 'フラグテスト・サンプル用',
    description: '「提供終了日」の表記がひらがなになります。',
    defaultValue: false,
    endAt: new Date('9999-12-31T00:00')
  },
  contain_strict_alternate: {
    title: 'contain: strict の代替',
    description:
      '「contain: strict」を「contain: inline-size layout paint style」で代替します。 ' +
      'WebKit 系ブラウザ (Safari など）でレイアウトが崩れる場合に有効にすることで不具合が解消される可能性があります。',
    defaultValue: isWebKit(),
    endAt: new Date('9999-12-31T00:00')
  },
  dose_construct_strict_starred_channel_tree: {
    title: 'お気に入りチャンネルをツリー表示',
    description:
      'お気に入りチャンネル一覧を、お気に入りに登録されたチャンネルのみの木構造で表示します。',
    defaultValue: false,
    endAt: new Date('2025-12-31T23:59')
  },
  does_save_sidebar_expansion_state: {
    title: 'サイドバーの展開状態を保持',
    description: 'サイドバーが展開されているかどうかを保持します。',
    defaultValue: false,
    endAt: new Date('2025-12-31T23:59')
  }
} as const satisfies Record<string, FeatureFlagDescription>

export type FeatureFlagKey = keyof typeof featureFlagDescriptions

type State = {
  status: Map<FeatureFlagKey, boolean | undefined>
}

const useFlagSettingsPinia = defineStore('app/featureFlagSettings', () => {
  const initialValue: State = {
    status: new Map<FeatureFlagKey, boolean | undefined>()
  }

  const [state, restoring, restoringPromise] = useIndexedDbValue(
    'store/app/featureFlagSettings',
    1,
    {},
    initialValue
  )

  const isFlagEnabled = (flag: FeatureFlagKey): boolean => {
    const featureFlag = featureFlagDescriptions[flag]
    if (featureFlag.endAt < new Date()) {
      return false
    }
    return state.status.get(flag) ?? featureFlag.defaultValue
  }

  const featureFlags = computed(() => {
    return Object.fromEntries(
      Object.entries(featureFlagDescriptions).map(([flag, featureFlag]) => [
        flag,
        {
          title: featureFlag.title,
          description: featureFlag.description,
          defaultValue: featureFlag.defaultValue,
          endAt: featureFlag.endAt,
          enabled: isFlagEnabled(flag as FeatureFlagKey)
        }
      ])
    ) as Record<FeatureFlagKey, FeatureFlag>
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
    featureFlags,
    restoring
  }
})

export const useFeatureFlagSettings = convertToRefsStore(useFlagSettingsPinia)

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useFlagSettingsPinia, import.meta.hot))
}
