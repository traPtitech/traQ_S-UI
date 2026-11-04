<template>
  <div :class="$style.container">
    <AIcon
      :class="$style.icon"
      mdi
      name="chevron-double"
      :size="28"
      @click="emit('open')"
    />
    <slot />
  </div>
</template>

<script lang="ts" setup>
import AIcon from '/@/components/UI/AIcon.vue'

const emit = defineEmits<{
  (e: 'open'): void
}>()
</script>

<style lang="scss" module>
.container {
  @include color-ui-primary;
  display: flex;
  flex-direction: column;
  width: 56px;
  height: 100%;
  align-items: center;
}

.icon {
  margin-bottom: 16px;
  margin-top: 16px;
  cursor: pointer;
  pointer-events: all;
  transition: transform 0.1s;
  &:hover {
    transform: scale(1.1);
  }
}
</style>
