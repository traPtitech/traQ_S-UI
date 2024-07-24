<template>
  <section :class="$style.featureFlagTab">
    <div v-if="!state.restoring.value">
      <feature-flag
        v-for="[key, item] in state.FeatureFlags.value"
        :key="key"
        :title="item.title"
        :description="item.description"
        :model-value="item.enabled"
        :end-at="item.endAt"
        @update:model-value="(v: boolean) => state.updateFeatureFlagStatus(key, v)"
      />
    </div>
    <div v-else>
      <p>Now loading...</p>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { useFeatureFlagSettings } from '/@/store/app/featureFlagSettings'
import FeatureFlag from '/@/components/Settings/FeatureFlagTab/FeatureFlag.vue'

const state = useFeatureFlagSettings()
</script>

<style lang="scss" module>
.featureFlagTab {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
</style>
