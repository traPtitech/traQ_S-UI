import { isIOS, isIOSApp, isPWA } from '/@/lib/dom/browser'

import { track } from './events'

export type ClientEnvironmentAttributes = {
  browser_name?: string
  browser_major_version?: string
  os_name?: string
  launch_mode: 'browser' | 'pwa' | 'ios_app'
}

const getLaunchMode = (): ClientEnvironmentAttributes['launch_mode'] => {
  if (isIOSApp(window)) return 'ios_app'
  return isPWA() ? 'pwa' : 'browser'
}

const getClientEnvironmentAttributes =
  async (): Promise<ClientEnvironmentAttributes> => {
    const { browserMeta, osMeta, unknownString } =
      await import('@grafana/faro-web-sdk')

    const { browser } =
      typeof browserMeta === 'function' ? browserMeta() : browserMeta
    const { os } = typeof osMeta === 'function' ? osMeta() : osMeta
    const name = browser?.name
    const version = browser?.version
    const osName = os?.name

    // Mac 形式の UA とタッチイベントが揃うと、macOS と iOS 系の両方が候補になる。
    const isAmbiguousMacUA = osName === 'Mac OS' && isIOS()

    return {
      browser_name: name === unknownString ? undefined : name,
      browser_major_version:
        version === unknownString ? undefined : version?.split('.')[0],
      os_name: isAmbiguousMacUA ? 'macOS or iOS/iPadOS' : osName,
      launch_mode: getLaunchMode()
    }
  }

export const trackAppStarted = () =>
  track('app_started', getClientEnvironmentAttributes)

export const trackClientEnvironmentSnapshot = () =>
  track('client_environment_snapshot', getClientEnvironmentAttributes)
