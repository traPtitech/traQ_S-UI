import { isIOSApp, isPWA } from '/@/lib/dom/browser'

import type { TelemetryEvents } from './events'

const getLaunchMode = (): TelemetryEvents['app_started']['launch_mode'] => {
  if (isIOSApp(window)) return 'ios_app'
  return isPWA() ? 'pwa' : 'browser'
}

export const getAppStartAttributes = async (): Promise<
  TelemetryEvents['app_started']
> => {
  const { browserMeta, osMeta, unknownString } =
    await import('@grafana/faro-web-sdk')
  const { browser } =
    typeof browserMeta === 'function' ? browserMeta() : browserMeta
  const { os } = typeof osMeta === 'function' ? osMeta() : osMeta
  const name = browser?.name
  const version = browser?.version

  return {
    browser_name: name === unknownString ? undefined : name,
    browser_major_version:
      version === unknownString ? undefined : version?.split('.')[0],
    os_name: os?.name,
    launch_mode: getLaunchMode()
  }
}
