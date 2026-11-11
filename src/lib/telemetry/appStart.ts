import { isIOS, isIOSApp, isPWA } from '/@/lib/dom/browser'

import type { TelemetryEvents } from './events'
import { track } from './events'

const getLaunchMode = (): TelemetryEvents['app_started']['launch_mode'] => {
  if (isIOSApp(window)) return 'ios_app'
  return isPWA() ? 'pwa' : 'browser'
}

const getAppStartAttributes = async (): Promise<
  TelemetryEvents['app_started']
> => {
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

export const trackAppStarted = () => track('app_started', getAppStartAttributes)
