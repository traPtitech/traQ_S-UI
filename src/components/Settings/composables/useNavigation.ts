import type { SettingsRouteName } from '/@/router/settings'
import { useRouter } from 'vue-router'
import {
  constructChannelPath,
  constructClipFoldersPath,
  constructUserPath,
  RouteName
} from '/@/router'
import { useBrowserSettings } from '/@/store/app/browserSettings'
import { useMainViewStore } from '/@/store/ui/mainView'

const isSkywayApikeySet = window.traQConfig.skyway !== undefined
const { primaryView } = useMainViewStore()

export type NavigationItemType =
  | 'profile'
  | 'session'
  | 'browser'
  | 'qall'
  | 'stamp'
  | 'theme'

// TODO: 言語系リソースの置き場所
export const navigationRouteNameTitleMap: Record<SettingsRouteName, string> = {
  settingsProfile: 'プロフィール',
  settingsSession: 'セッション',
  settingsBrowser: 'ブラウザ',
  settingsQall: '通話 (Qall)',
  settingsStamp: 'スタンプ',
  settingsTheme: 'テーマ'
}

export const navigations: {
  routeName: SettingsRouteName
  iconName: string
  iconMdi?: true
}[] = [
  {
    routeName: 'settingsProfile',
    iconName: 'user'
  },
  {
    routeName: 'settingsSession',
    iconName: 'key-chain',
    iconMdi: true
  },
  {
    routeName: 'settingsBrowser',
    iconName: 'cogs',
    iconMdi: true
  },
  ...(isSkywayApikeySet
    ? [
        {
          routeName: 'settingsQall',
          iconName: 'phone',
          iconMdi: true
        } as const
      ]
    : []),
  {
    routeName: 'settingsStamp',
    iconName: 'emoticon-outline',
    iconMdi: true
  },
  {
    routeName: 'settingsTheme',
    iconName: 'brightness-6',
    iconMdi: true
  }
]

const useSettingsNavigation = () => {
  const router = useRouter()
  const { lastOpenChannelName } = useBrowserSettings()
  const close = () => {
    switch (primaryView.value.type) {
      case 'channel':
        router.push(constructChannelPath(primaryView.value.channelId))
        break
      case 'clips':
        router.push(constructClipFoldersPath(primaryView.value.clipFolderId))
        break
      case 'dm':
        router.push(constructUserPath(primaryView.value.userName))
        break
      default:
        router.push(constructChannelPath(lastOpenChannelName.value))
    }
  }
  const showRoot = () => {
    router.push({ name: RouteName.Settings })
  }
  return { close, showRoot }
}
export default useSettingsNavigation
