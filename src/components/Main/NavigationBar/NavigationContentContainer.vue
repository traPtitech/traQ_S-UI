<template>
  <!-- TODO: 折り畳み -->
  <div>
    <div :class="$style.subtitleContainer">
      <h3 v-if="subtitle && subtitle.length > 0" :class="$style.subtitle">
        {{ subtitle }}
      </h3>
      <div :class="$style.control">
        <slot name="control" />
      </div>
    </div>
    <slot />
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  subtitle?: string
}>()
</script>

<style lang="scss" module>
.subtitleContainer {
  display: flex;
  justify-content: space-between;
}
.subtitle {
  @include color-ui-secondary;
  @include size-body2;
  margin-bottom: 8px;
  font-weight: bold;
}
.control {
  flex-shrink: 0;
}
</style>
