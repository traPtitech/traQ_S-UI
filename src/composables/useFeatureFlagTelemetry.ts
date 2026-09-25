import { watch } from 'vue'

import { useDocumentVisibility, useIntervalFn } from '@vueuse/core'

import { telemetry } from '/@/lib/telemetry'
import type { FeatureFlagKey } from '/@/store/app/featureFlagSettings'
import {
  featureFlagDescriptions,
  useFeatureFlagSettings
} from '/@/store/app/featureFlagSettings'

export const useFeatureFlagTelemetry = () => {
  const { restoring, getFeatureFlagState } = useFeatureFlagSettings()
  const visibility = useDocumentVisibility()

  const snapshot = () => {
    if (restoring.value || visibility.value !== 'visible') return
    for (const flag of Object.keys(
      featureFlagDescriptions
    ) as FeatureFlagKey[]) {
      void telemetry.track('feature_flag_snapshot', {
        flag,
        ...getFeatureFlagState(flag)
      })
    }
  }

  watch([restoring, visibility], snapshot, { immediate: true })
  useIntervalFn(snapshot, 15 * 60 * 1000)
}
