import type { FeatureFlagKey } from '/@/store/app/featureFlagSettings'

export type FeatureFlagSource = 'default' | 'override' | 'expired'

export type TelemetryEvents = {
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
