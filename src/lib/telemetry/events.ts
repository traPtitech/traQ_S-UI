import type { FeatureFlagKey } from '/@/store/app/featureFlagSettings'

import { publish } from './client'

export type FeatureFlagSource = 'default' | 'override' | 'expired'

export type TelemetryEvents = {
  app_started: {
    browser_name?: string
    browser_major_version?: string
    os_name?: string
    launch_mode: 'browser' | 'pwa' | 'ios_app'
  }
  feature_flag_snapshot: {
    flag: FeatureFlagKey
    enabled: boolean
    source: FeatureFlagSource
  }
  feature_flag_changed: {
    flag: FeatureFlagKey
    enabled: boolean
    previous_enabled: boolean
  }
  feature_used: {
    feature: string
    entry_point?: string
  }
}

export const track = <Name extends keyof TelemetryEvents>(
  name: Name,
  attributes: TelemetryEvents[Name] | (() => Promise<TelemetryEvents[Name]>)
): Promise<void> => {
  const timestamp = Date.now()

  return publish(async (api, clientId) => {
    const eventAttributes =
      typeof attributes === 'function' ? await attributes() : attributes

    const values = Object.fromEntries(
      Object.entries(eventAttributes)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)])
    )

    api.pushEvent(
      name,
      {
        ...values,
        client_id: clientId,
        event_id: crypto.randomUUID(),
        schema_version: '1'
      },
      'activity',
      { timestampOverwriteMs: timestamp }
    )
  })
}
