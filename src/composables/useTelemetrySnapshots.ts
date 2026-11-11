import { watch } from 'vue'

import { useDocumentVisibility, useIntervalFn } from '@vueuse/core'

import { telemetry } from '/@/lib/telemetry'
import type { FeatureFlagKey } from '/@/store/app/featureFlagSettings'
import {
  featureFlagDescriptions,
  useFeatureFlagSettings
} from '/@/store/app/featureFlagSettings'
import { useMeStore } from '/@/store/domain/me'

export const useTelemetrySnapshots = () => {
  const { restoring, getFeatureFlagState } = useFeatureFlagSettings()
  const { myId } = useMeStore()
  const visibility = useDocumentVisibility()

  const canSendSnapshot = () =>
    Boolean(myId.value) && visibility.value === 'visible'

  const snapshotClientEnvironment = () => {
    if (!canSendSnapshot()) return
    void telemetry.trackClientEnvironmentSnapshot()
  }

  const snapshotFeatureFlags = () => {
    if (restoring.value || !canSendSnapshot()) return

    for (const flag of Object.keys(
      featureFlagDescriptions
    ) as FeatureFlagKey[]) {
      void telemetry.track('feature_flag_snapshot', {
        flag,
        ...getFeatureFlagState(flag)
      })
    }
  }

  watch([myId, visibility], snapshotClientEnvironment, { immediate: true })
  watch([myId, restoring, visibility], snapshotFeatureFlags, {
    immediate: true
  })
  useIntervalFn(
    () => {
      snapshotClientEnvironment()
      snapshotFeatureFlags()
    },
    15 * 60 * 1000
  )
}
