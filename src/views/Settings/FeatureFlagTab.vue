<template>
  <section :class="$style.featureFlagTab">
    <div v-if="!restoring">
      <feature-flag
        v-for="[key, item] in Object.entries(featureFlags)"
        :key="key"
        :title="item.title"
        :description="item.description"
        :model-value="item.enabled"
        :end-at="item.endAt"
        @update:model-value="(v: boolean) => updateFeatureFlagStatus(key as FeatureFlagKey, v)"
      />
    </div>
    <div v-else>
      <p>Now loading...</p>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { useFeatureFlagSettings, type FeatureFlagKey } from '/@/store/app/featureFlagSettings'
import FeatureFlag from '/@/components/Settings/FeatureFlagTab/FeatureFlag.vue'

const { updateFeatureFlagStatus, featureFlags, restoring } =
  useFeatureFlagSettings()
</script>

<style lang="scss" module>
.featureFlagTab {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
</style>
