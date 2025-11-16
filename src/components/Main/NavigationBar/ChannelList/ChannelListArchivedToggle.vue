<template>
  <div :class="$style.container">
    <label :class="$style.toggleLabel">アーカイブ済みチャンネルを表示</label>
    <div :class="$style.spacer" />
    <AToggle v-model="showArchived" :class="$style.toggle" />
  </div>
</template>

<script lang="ts" setup>
import AToggle from '/@/components/UI/AToggle.vue'

const showArchived = defineModel<boolean>('showArchived', {
  required: false,
  default: false
})
</script>

<style module lang="scss" scoped>
.container {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;

  .toggleLabel {
    @include size-body2;
    color: var(--color-text-secondary);
  }

  .spacer {
    width: 0.9rem;
  }

  .toggle {
    margin-right: 1rem;
    min-width: 44px; // AToggleの最小幅に合わせる
  }
}
</style>
